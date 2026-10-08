const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications
router.get('/', authenticateToken, (req, res) => {
  try {
    const notifications = db.prepare(`
      SELECT n.*, f.finding_code
      FROM notifications n
      LEFT JOIN findings f ON n.finding_id = f.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 20
    `).all(req.user.id);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND is_read = 0
    `).get(req.user.id).count;

    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil notifikasi.' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true, message: 'Notifikasi ditandai telah dibaca.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengupdate notifikasi.' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticateToken, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
    res.json({ success: true, message: 'Semua notifikasi ditandai telah dibaca.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengupdate notifikasi.' });
  }
});

module.exports = router;
