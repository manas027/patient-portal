// backend/server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// load DB (this runs migrations in db.js)
const db = require('./db');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());

// multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

function fileFilter(req, file, cb) {
    const isPdf = file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname);
    if (!isPdf) return cb(new Error('Only PDF files are allowed'), false);
    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
});

// POST /api/files - upload single PDF (form field name: file)
app.post('/api/files', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded or wrong file type' });

    const { filename, originalname, size, mimetype } = req.file;
    const stmt = db.prepare('INSERT INTO files (filename, original_name, size, mime) VALUES (?, ?, ?, ?)');
    stmt.run(filename, originalname, size, mimetype, function (err) {
        if (err) {
            // cleanup uploaded file if DB fails
            fs.unlink(path.join(UPLOAD_DIR, filename), () => { });
            return res.status(500).json({ error: 'DB insert failed' });
        }
        const insertedId = this.lastID;
        db.get('SELECT id, original_name AS name, size, mime, created_at FROM files WHERE id = ?', [insertedId], (err, row) => {
            if (err) return res.status(500).json({ error: 'Could not fetch inserted row' });
            return res.status(201).json({ file: row });
        });
    });
});

// GET /api/files - list all files
app.get('/api/files', (req, res) => {
    db.all('SELECT id, original_name AS name, size, mime, created_at FROM files ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json({ files: rows });
    });
});

// GET /api/files/:id/download - download file as attachment
app.get('/api/files/:id/download', (req, res) => {
    const id = parseInt(req.params.id, 10);
    db.get('SELECT filename, original_name FROM files WHERE id = ?', [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'File not found' });
        const filePath = path.join(UPLOAD_DIR, row.filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing on server' });
        res.download(filePath, row.original_name);
    });
});

// DELETE /api/files/:id - delete DB record and file
app.delete('/api/files/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    db.get('SELECT filename FROM files WHERE id = ?', [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'File not found' });

        db.run('DELETE FROM files WHERE id = ?', [id], function (err) {
            if (err) return res.status(500).json({ error: 'Failed to delete DB record' });

            const filePath = path.join(UPLOAD_DIR, row.filename);
            fs.unlink(filePath, (fsErr) => {
                // if unlink error, still respond success since DB entry is removed
                if (fsErr) console.warn('Failed to delete file from disk:', fsErr);
                return res.json({ message: 'File deleted' });
            });
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
