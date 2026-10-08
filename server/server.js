const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Format file tidak didukung. Hanya JPG, PNG, dan PDF yang diperbolehkan (maks 5 MB).'));
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/uploads', express.static(uploadDir));
app.use('/images', express.static(uploadDir));
app.use('/images', express.static(path.join(__dirname, '..', 'client', 'public', 'images')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/findings', require('./routes/findings'));
app.use('/api/follow-ups', require('./routes/follow_ups'));
app.use('/api/verifications', require('./routes/verifications'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users', require('./routes/users'));

// File Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      data: {
        fileName: req.file.originalname,
        fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengunggah file.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SIMATAP UMM API', time: new Date().toISOString() });
});

// Auto-seed and start server
seedDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`=============================================`);
      console.log(`  SIMATAP UMM Backend Server Running`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log(`=============================================`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  });
