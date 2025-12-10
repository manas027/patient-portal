// backend/db.js
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_FILE = path.join(__dirname, 'db.sqlite');
const MIGRATION_FILE = path.join(__dirname, 'migrations', 'init.sql');

// ensure migrations file exists
if (!fs.existsSync(MIGRATION_FILE)) {
    console.error('Migration file missing:', MIGRATION_FILE);
    process.exit(1);
}

const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('Failed to open DB:', err);
        process.exit(1);
    }
});

// run migration SQL
const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
db.exec(sql, (err) => {
    if (err) {
        console.error('Failed to run migrations:', err);
        process.exit(1);
    } else {
        console.log('Database initialized / migrations applied.');
    }
});

module.exports = db;
