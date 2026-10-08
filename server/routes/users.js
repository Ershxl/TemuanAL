const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/users (list all users / PICs)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, name, username, email, role, department, phone FROM users';
    let params = [];

    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }

    query += ' ORDER BY name ASC';
    const users = db.prepare(query).all(...params);

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data pengguna.' });
  }
});

// GET /api/users/pics (list all PICs specifically)
router.get('/pics', authenticateToken, (req, res) => {
  try {
    const pics = db.prepare(`
      SELECT id, name, username, email, department, phone
      FROM users
      WHERE role = 'PIC' OR role = 'Admin'
      ORDER BY name ASC
    `).all();

    res.json({ success: true, data: pics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data PIC.' });
  }
});

module.exports = router;
