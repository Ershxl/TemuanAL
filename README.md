# SIMATAP UMM – Modul Temuan AL
### Sistem Informasi Manajemen Asesmen Internal Perguruan Tinggi – Universitas Muhammadiyah Malang

Aplikasi web full-stack modern, profesional, dan responsif untuk mencatat, mengelola, menindaklanjuti, memverifikasi, dan membuat laporan komprehensif terkait temuan hasil asesmen lapangan (AL) di lingkungan **Universitas Muhammadiyah Malang (UMM)**.

---

## 🏛️ 1. Identitas Visual & Desain
- **Warna Utama:** Maroon UMM (`#600505`)
- **Warna Pendukung:** Putih (`#FFFFFF`), Netral Gray (`#F8F9FB`), Border Gray (`#E5E7EB`)
- **Tipografi:** *Inter* (Google Fonts)
- **Komponen:** Card, Clean Table, Badge Status, Modal Dialog, Character Counter, Notification Dropdown, Charts & Progress Bars, Empty State, Image Zoom Lightbox.

---

## 👥 2. Hak Akses & Peran Pengguna (Role-Based Access)

| Role | Akun Demo | Password | Hak Akses Utama |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Kelola seluruh temuan, tentukan PIC, ubah status, lihat laporan, manajemen pengguna |
| **Asesor / Verifikator** | `asesor` | `asesor123` | Catat temuan baru, verifikasi tindak lanjut PIC, putuskan validitas (Valid/Catatan/Tidak Valid), unduh laporan |
| **PIC (Penanggung Jawab)** | `pic_sarpras` | `pic123` | Lihat temuan yang ditugaskan, input tindak lanjut perbaikan, unggah bukti fisik, ajukan status *Menunggu Verifikasi* |

*Tersedia juga fitur **Ganti Akun Demo Cepat (1-Click Switcher)** pada menu profil & halaman login untuk kemudahan pengujian.*

---

## 🔄 3. Alur Kerja Utama (Workflow)

```
Login ─▶ Dashboard ─▶ Daftar Temuan ─▶ Tambah Temuan (Otomatis ID TM-2026-xxx)
                             │
                             └─▶ Detail Temuan ─▶ Tindak Lanjut PIC (Upload Bukti Selesai)
                                        │
                                        └─▶ Verifikasi Asesor (Valid/Tidak Valid) ─▶ Status Close / Perlu Perbaikan ─▶ Laporan & Export
```

### Siklus Status Temuan:
1. **Open** : Temuan baru tercatat dan belum selesai ditindaklanjuti.
2. **Dalam Proses** : Sedang dikerjakan oleh PIC di lapangan.
3. **Menunggu Verifikasi** : PIC telah mengirimkan laporan tindakan beserta foto bukti penyelesaian.
4. **Perlu Perbaikan** : Hasil verifikasi ditolak/tidak valid oleh asesor dan harus diperbaiki ulang.
5. **Close** : Tindak lanjut telah disetujui/valid oleh asesor dan temuan resmi ditutup.

---

## 💻 4. Teknologi yang Digunakan (Tech Stack)

### Frontend:
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + PostCSS
- **Icons:** Lucide React
- **Visualisasi & Grafik:** Recharts (Bar Chart & Donut Chart)
- **Ekspor Dokumen:** jsPDF, jspdf-autotable, XLSX (Excel)
- **Animasi:** Canvas Confetti & CSS Transitions

### Backend:
- **Runtime:** Node.js & Express REST API
- **Database:** SQLite Relational Engine (`better-sqlite3`)
- **Keamanan & Autentikasi:** JSON Web Token (JWT), Bcrypt password hashing
- **File Storage:** Multer Upload Handler (JPG, PNG, PDF maks 5 MB)
- **Audit & Logging:** Real-time Activity Log & Notifications System

---

## 📁 5. Struktur Folder Proyek

```
Temuan AL/
├── client/                     # Frontend React + Vite App
│   ├── public/
│   │   └── images/             # Gambar & aset gedung UMM
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Badge, Modal, ConfirmDialog, ImageZoom
│   │   │   └── layout/         # Sidebar, Header, Layout wrapper
│   │   ├── context/            # AuthContext & NotificationContext
│   │   ├── pages/              # 8 Halaman Inti SIMATAP
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── FindingsListPage.jsx
│   │   │   ├── CreateFindingPage.jsx
│   │   │   ├── FindingDetailPage.jsx
│   │   │   ├── VerificationPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/           # Axios / Fetch API Client
│   │   ├── App.jsx             # Router & Navigasi
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Tailwind base styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend Node.js Express API
│   ├── middleware/
│   │   └── auth.js             # JWT verification & role authorization
│   ├── routes/
│   │   ├── auth.js             # Login, profile update, password change, audit
│   │   ├── findings.js         # CRUD Temuan, multi-filter, auto-ID, stats
│   │   ├── follow_ups.js       # PIC Tindak lanjut & status transition
│   │   ├── verifications.js    # Keputusan Asesor & notifikasi
│   │   ├── dashboard.js        # KPI cards, grafik bulanan, distribusi status
│   │   ├── reports.js          # Ringkasan per kategori, % close, ekspor Excel
│   │   ├── notifications.js    # Notifikasi pengguna & mark as read
│   │   └── users.js            # Daftar PIC & pengguna
│   ├── uploads/                # Berkas bukti foto & dokumen terunggah
│   ├── db.js                   # Inisialisasi skema database relasional
│   ├── seed.js                 # 25 Data dummy realistik sesuai prototipe
│   ├── server.js               # Entry point Express API Server
│   └── package.json
│
├── design.md                   # Dokumen spesifikasi visual & UI
├── PRD.md                      # Product Requirements Document
├── package.json                # Root npm workspace
└── README.md
```

---

## 🗄️ 6. Skema Database Relasional

```sql
-- Tabel Pengguna (Users)
CREATE TABLE users (
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

-- Tabel Temuan Asesmen Lapangan (Findings)
CREATE TABLE findings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  finding_code TEXT UNIQUE NOT NULL,       -- Format: TM-2026-025
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('Tinggi', 'Sedang', 'Rendah')),
  status TEXT NOT NULL CHECK(status IN ('Open', 'Ditugaskan', 'Dalam Proses', 'Menunggu Verifikasi', 'Perlu Perbaikan', 'Close')),
  finding_date TEXT NOT NULL,
  pic_id INTEGER REFERENCES users(id),
  target_date TEXT,
  created_by INTEGER REFERENCES users(id),
  notes TEXT DEFAULT '',
  semester_period TEXT DEFAULT 'Semester Genap 2025/2026',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Lampiran Bukti (Attachments)
CREATE TABLE attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  finding_id INTEGER REFERENCES findings(id),
  follow_up_id INTEGER REFERENCES follow_ups(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'image/jpeg',
  file_size INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Tindak Lanjut PIC (Follow-ups)
CREATE TABLE follow_ups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  finding_id INTEGER REFERENCES findings(id),
  pic_id INTEGER REFERENCES users(id),
  description TEXT NOT NULL,
  action_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Menunggu Verifikasi',
  notes TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Verifikasi Asesor (Verifications)
CREATE TABLE verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  finding_id INTEGER REFERENCES findings(id),
  verifier_id INTEGER REFERENCES users(id),
  decision TEXT NOT NULL CHECK(decision IN ('Valid', 'Valid dengan Catatan', 'Tidak Valid')),
  notes TEXT DEFAULT '',
  verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Riwayat Perubahan & Audit Trail (Activity Logs)
CREATE TABLE activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  finding_id INTEGER REFERENCES findings(id),
  user_id INTEGER REFERENCES users(id),
  user_name TEXT NOT NULL,
  activity TEXT NOT NULL,                  -- Create, Update, FollowUp, Verify, StatusChange
  description TEXT NOT NULL,
  ip_address TEXT DEFAULT '127.0.0.1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Notifikasi (Notifications)
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  finding_id INTEGER REFERENCES findings(id),
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 7. Cara Menjalankan Aplikasi Secara Lokal

### Prasyarat:
- **Node.js** (Versi 18+ atau 20+)
- **npm** (Versi 9+)

### Langkah 1: Clone Repository & Buka Folder
```bash
git clone <URL_REPOSITORY>
cd "Temuan AL"
```

### Langkah 2: Install Dependensi
```bash
# Install root, backend, dan frontend dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### Langkah 3: Menjalankan Server & Client Secara Bersamaan
Cukup jalankan satu perintah:
```bash
npm run dev
```

Server backend akan berjalan di `http://localhost:5000` dan aplikasi web client akan terbuka di `http://localhost:5173`.

---

## 📡 8. REST API Endpoints

### Autentikasi (`/api/auth`)
- `POST /api/auth/login` : Login user (username/email + password)
- `GET /api/auth/me` : Ambil data profil pengguna yang sedang login
- `PUT /api/auth/profile` : Ubah informasi profil (nama, email, telepon, unit kerja, alamat)
- `PUT /api/auth/password` : Ganti password dengan verifikasi kriteria keamanan
- `GET /api/auth/activity-logs` : Ambil log aktivitas audit trail akun

### Temuan Asesmen Lapangan (`/api/findings`)
- `GET /api/findings` : Ambil daftar temuan dengan multi-filter (periode, kategori, status, lokasi, pencarian, pagination)
- `GET /api/findings/:id` : Ambil detail temuan beserta relasi lampiran, tindak lanjut, verifikasi, dan riwayat
- `POST /api/findings` : Tambah temuan baru (otomatis membuat kode `TM-2026-xxx` & notifikasi PIC)
- `PUT /api/findings/:id` : Update data temuan / delegasi PIC
- `PUT /api/findings/:id/status` : Ubah status temuan secara langsung

### Tindak Lanjut PIC (`/api/follow-ups`)
- `POST /api/follow-ups/:findingId` : PIC kirim laporan perbaikan fisik & unggah bukti foto (otomatis transisi ke *Menunggu Verifikasi*)

### Verifikasi Asesor (`/api/verifications`)
- `GET /api/verifications/pending` : Ambil daftar antrean temuan yang berstatus *Menunggu Verifikasi*
- `POST /api/verifications/:findingId` : Simpan keputusan verifikasi (*Valid*, *Valid dengan Catatan*, *Tidak Valid*)

### Dashboard & Laporan (`/api/dashboard` & `/api/reports`)
- `GET /api/dashboard/stats` : Rekap KPI ringkasan, grafik bulanan, dan distribusi status
- `GET /api/reports` : Ringkasan temuan per kategori, perhitungan % Close, dan data statistik
- `GET /api/reports/export-excel` : Download laporan dalam format file spreadsheet Excel (`.xlsx`)

### Berkas & Notifikasi (`/api/upload` & `/api/notifications`)
- `POST /api/upload` : Upload file bukti lampiran (JPG, PNG, PDF maks 5 MB)
- `GET /api/notifications` : Ambil daftar notifikasi pengguna
- `PUT /api/notifications/:id/read` : Tandai notifikasi telah dibaca
- `PUT /api/notifications/read-all` : Tandai semua notifikasi telah dibaca

---

## 🧪 9. Akun Pengujian Demo (Pre-loaded)

| Username | Password | Role | Nama Lengkap | Unit Kerja |
|---|---|---|---|---|
| `admin` | `admin123` | Admin | Administrator SIMATAP | Badan Penjaminan Mutu Internal (BPMI) |
| `asesor` | `asesor123` | Verifikator | Asesor UMM | Tim Asesor Internal Mutu UMM |
| `pic_sarpras` | `pic123` | PIC | Budi Santoso (Sarpras) | Biro Administrasi Umum & Sarpras |
| `pic_lab` | `pic123` | PIC | Dewi Lestari (Kepala Lab) | UPT Laboratorium Terpadu |
| `pic_akademik` | `pic123` | PIC | Ahmad Fauzi (Akademik) | Biro Administrasi Akademik |

---

## 📄 10. Lisensi
Hak Cipta © 2026 Universitas Muhammadiyah Malang (UMM). Seluruh hak cipta dilindungi undang-undang.
