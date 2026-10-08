const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'simatap.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

function initDb() {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Admin', 'Verifikator', 'Asesor', 'PIC')),
      phone TEXT DEFAULT '',
      department TEXT DEFAULT '',
      address TEXT DEFAULT '',
      profile_photo TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Findings (Temuan AL) Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS findings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      finding_code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      priority TEXT NOT NULL CHECK(priority IN ('Tinggi', 'Sedang', 'Rendah')),
      status TEXT NOT NULL CHECK(status IN ('Open', 'Ditugaskan', 'Dalam Proses', 'Menunggu Verifikasi', 'Perlu Perbaikan', 'Close')),
      finding_date TEXT NOT NULL,
      pic_id INTEGER,
      target_date TEXT,
      created_by INTEGER NOT NULL,
      notes TEXT DEFAULT '',
      semester_period TEXT DEFAULT 'Semester Genap 2025/2026',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pic_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. Attachments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      finding_id INTEGER,
      follow_up_id INTEGER,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT DEFAULT 'image/jpeg',
      file_size INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE,
      FOREIGN KEY (follow_up_id) REFERENCES follow_ups(id) ON DELETE CASCADE
    );
  `);

  // 4. Follow-ups (Tindak Lanjut PIC) Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS follow_ups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      finding_id INTEGER NOT NULL,
      pic_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      action_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Menunggu Verifikasi',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE,
      FOREIGN KEY (pic_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 5. Verifications Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      finding_id INTEGER NOT NULL,
      verifier_id INTEGER NOT NULL,
      decision TEXT NOT NULL CHECK(decision IN ('Valid', 'Valid dengan Catatan', 'Tidak Valid')),
      notes TEXT DEFAULT '',
      verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE,
      FOREIGN KEY (verifier_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 6. Activity Logs (Riwayat Perubahan & Audit Trail) Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      finding_id INTEGER,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      activity TEXT NOT NULL,
      description TEXT NOT NULL,
      ip_address TEXT DEFAULT '127.0.0.1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 7. Notifications Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      finding_id INTEGER,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE
    );
  `);
}

initDb();

module.exports = db;
