-- migrations/init.sql
CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,       -- actual stored filename on disk
  original_name TEXT NOT NULL,  -- original uploaded filename
  size INTEGER NOT NULL,        -- size in bytes
  mime TEXT NOT NULL,           -- MIME type (application/pdf)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
