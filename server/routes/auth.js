const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username/email dan password wajib diisi.' });
    }

    // Find user by username or email
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Username/Email atau password salah.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Username/Email atau password salah.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Record login in activity logs
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    db.prepare(`
      INSERT INTO activity_logs (user_id, user_name, activity, description, ip_address)
      VALUES (?, ?, 'Login', ?, ?)
    `).run(user.id, user.name, `Pengguna berhasil login ke sistem SIMATAP`, clientIp);

    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, username, email, role, phone, department, address, profile_photo, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data profil.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, email, phone, department, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Nama dan Email wajib diisi.' });
    }

    // Check email collision
    const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.id);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh akun lain.' });
    }

    db.prepare(`
      UPDATE users
      SET name = ?, email = ?, phone = ?, department = ?, address = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, email, phone || '', department || '', address || '', req.user.id);

    // Log update
    db.prepare(`
      INSERT INTO activity_logs (user_id, user_name, activity, description, ip_address)
      VALUES (?, ?, 'Update', 'Pengguna memperbarui informasi profil akun', ?)
    `).run(req.user.id, name, req.ip || '127.0.0.1');

    const updatedUser = db.prepare('SELECT id, name, username, email, role, phone, department, address, profile_photo, created_at FROM users WHERE id = ?').get(req.user.id);

    res.json({ success: true, message: 'Profil berhasil diperbarui.', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil.' });
  }
});

// PUT /api/auth/password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Password saat ini dan password baru wajib diisi.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Konfirmasi password tidak cocok.' });
    }

    // Validate password complexity
    // Minimal 8 karakter, huruf besar dan kecil, angka, karakter spesial
    const lengthRegex = /.{8,}/;
    const upperRegex = /[A-Z]/;
    const lowerRegex = /[a-z]/;
    const numberRegex = /[0-9]/;
    const specialRegex = /[^A-Za-z0-9]/;

    if (
      !lengthRegex.test(newPassword) ||
      !upperRegex.test(newPassword) ||
      !lowerRegex.test(newPassword) ||
      !numberRegex.test(newPassword) ||
      !specialRegex.test(newPassword)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Password baru harus minimal 8 karakter dan mengandung huruf besar, huruf kecil, angka, serta karakter khusus.'
      });
    }

    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password saat ini tidak sesuai.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hashed, req.user.id);

    // Log password change
    db.prepare(`
      INSERT INTO activity_logs (user_id, user_name, activity, description, ip_address)
      VALUES (?, ?, 'Update', 'Pengguna mengubah password akun', ?)
    `).run(req.user.id, req.user.name, req.ip || '127.0.0.1');

    res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah password.' });
  }
});

// GET /api/auth/activity-logs
router.get('/activity-logs', authenticateToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const logs = db.prepare(`
      SELECT * FROM activity_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(req.user.id, limit);

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat aktivitas.' });
  }
});

module.exports = router;
