# Patient Portal – Medical Document Manager

A full-stack web application where patients can upload, view, download, and delete their **medical PDF documents** (prescriptions, reports, test results, etc.).

This is a local demo project designed for an internship assignment to showcase frontend + backend + database skills.

---

## 🚀 Tech Stack

**Frontend**
- HTML5
- CSS3
- Vanilla JavaScript (Fetch API)

**Backend**
- Node.js
- Express.js
- Multer (file uploads)
- CORS enabled

**Database**
- SQLite (local), auto-created via migration SQL file

**Storage**
- PDF files stored in local `uploads/` folder

---

## 📂 Project Structure

```
patient-portal/
│
├── backend/
│   ├── server.js              # Express server + routes
│   ├── db.js                  # SQLite connection + migrations
│   ├── db.sqlite              # Auto-created SQLite file
│   ├── migrations/
│   │     └── init.sql         # Table creation script
│   ├── uploads/               # Stored PDF files
│   ├── package.json
│   └── node_modules/
│
├── frontend/
│   ├── index.html             # UI
│   ├── css/
│   │     └── style.css
│   ├── js/
│   │     └── app.js
│   └── assets/ (optional)
│
└── README.md
```

---

## 🛠️ Step-by-step Run Instructions (Full Stack)

Follow these steps to run the application locally on your machine. These instructions include both backend and frontend setup and some troubleshooting tips for Windows.

### Prerequisites

1. **Node.js** (v14+ recommended) — includes `node` and `npm`.
   - Download: https://nodejs.org/
2. **A modern web browser** (Chrome, Edge, Firefox).
3. Optional: **Python 3** (only needed if you want to serve the frontend with a static server).

If you are on **Windows PowerShell**, you may need to allow execution of local npm scripts (see troubleshooting below).

---

### 1) Prepare the project

Open a terminal and navigate to your project root (where `patient-portal/` lives):

```bash
cd "D:\html tests\patient-portal"
```

> Note: include quotes if there are spaces in the path.


### 2) Install backend dependencies

Change into the backend folder and install dependencies (only once):

```bash
cd backend
npm install
```

This installs `express`, `multer`, `sqlite3`, and `cors` as defined in `package.json`.


### 3) Start the backend server

Run the server from the `backend/` folder:

```bash
node server.js
```

Expected console output:

```
Database initialized / migrations applied.
Server running at http://localhost:5000
```

If you see that, the backend API is live at `http://localhost:5000/api/files`.


### 4) Open the frontend (two easy options)

#### Option A — Open the HTML file directly (quickest)

Double-click `frontend/index.html` or open it from the browser (`file://` URL). The page will make fetch requests to the backend (`http://localhost:5000`).

> Most browsers allow `file://` pages to call `http://localhost` endpoints. If yours blocks it, use Option B.


#### Option B — Serve the frontend on a simple local server (recommended for fewer browser quirks)

From the project root or the `frontend/` folder, run either Python or the `serve` package.

**With Python 3** (no install required on many systems):

```bash
cd frontend
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.

**With `serve` (npm)**:

```bash
npm install -g serve
serve frontend
```


### 5) Test the app

- Open the frontend in the browser.
- Use the **Upload PDF** form to choose and upload a PDF.
- After successful upload, the file appears in the table with **Download** and **Delete** actions.
- Test downloading and deleting to ensure both disk file and DB row handling work.

You can also test APIs directly using `curl` or Postman (examples below).


### API quick commands (curl)

Upload a PDF:

```bash
curl -F "file=@/full/path/to/test.pdf" http://localhost:5000/api/files
```

List files:

```bash
curl http://localhost:5000/api/files
```

Download file with id 1:

```bash
curl -OJ http://localhost:5000/api/files/1/download
```

Delete file with id 1:

```bash
curl -X DELETE http://localhost:5000/api/files/1
```


---

## 🔧 Troubleshooting & Windows PowerShell notes

### PowerShell "scripts are disabled" error when running `npm` commands

If you get an error like:

```
File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

Fix (run as Administrator once):

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then close and reopen PowerShell and re-run `npm` commands.


### "Cannot find module server.js" or wrong folder errors

Make sure you run `node server.js` from the `backend/` folder (or pass the full path):

```powershell
cd "D:\html tests\patient-portal\backend"  // you first need to copy and run this in your VS code terminal and then start server file.
node server.js
```


### If port 5000 is already in use

Either stop the process using port 5000 or set `PORT` env var before starting:

```bash
# PowerShell
$env:PORT=6000; node server.js

# Linux/macOS or WSL
PORT=6000 node server.js
```


### If uploads don't appear in DB

- Check server console for multer or DB errors.
- Verify `uploads/` contains the uploaded file filename.
- Check `db.sqlite` timestamp and file size.


---

## 📘 How it works (summary)

- Upload form sends `multipart/form-data` to `/api/files`.
- Multer stores PDF in `uploads/` and the backend inserts metadata into SQLite.
- `GET /api/files` returns the metadata list for the frontend.
- `GET /api/files/:id/download` streams the file as an attachment.
- `DELETE /api/files/:id` deletes the DB row and the file on disk.


---

## 🔁 Next steps (optional)

- Add authentication (JWT) for multi-user support.
- Add file previews and categories.
- Add pagination and search for large file sets.
- Deploy backend to Render/Heroku and use cloud storage (S3) for production.


---

## 👨‍💻 Author

This project was created as part of a Full Stack Developer Internship Assignment.

---


*If you want any part of these instructions changed (more screenshots, exact commands for Git/GitHub, or a single-click `start` script), tell me and I’ll edit the README.*

