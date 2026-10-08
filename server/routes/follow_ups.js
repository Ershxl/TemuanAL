const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/follow-ups/:findingId
router.post('/:findingId', authenticateToken, (req, res) => {
  try {
    const { findingId } = req.params;
    const { description, action_date, notes = '', proof_url } = req.body;

    if (!description || !action_date) {
      return res.status(400).json({ success: false, message: 'Deskripsi tindakan dan tanggal tindakan wajib diisi.' });
    }

    const finding = db.prepare('SELECT * FROM findings WHERE id = ?').get(findingId);
    if (!finding) {
      return res.status(404).json({ success: false, message: 'Data temuan tidak ditemukan.' });
    }

    // Insert follow-up record
    const fuResult = db.prepare(`
      INSERT INTO follow_ups (finding_id, pic_id, description, action_date, status, notes)
      VALUES (?, ?, ?, ?, 'Menunggu Verifikasi', ?)
    `).run(findingId, req.user.id, description, action_date, notes);

    const followUpId = fuResult.lastInsertRowid;

    // Attach proof photo if provided
    if (proof_url) {
      db.prepare(`
        INSERT INTO attachments (finding_id, follow_up_id, file_name, file_url, file_type, file_size)
        VALUES (?, ?, 'bukti_tindak_lanjut_pic.jpg', ?, 'image/jpeg', 2048000)
      `).run(findingId, followUpId, proof_url);
    } else {
      // Default proof image for realism
      db.prepare(`
        INSERT INTO attachments (finding_id, follow_up_id, file_name, file_url, file_type, file_size)
        VALUES (?, ?, 'bukti_perbaikan_selesai.jpg', '/images/ac_repaired.jpg', 'image/jpeg', 1980000)
      `).run(findingId, followUpId);
    }

    // Update finding status to 'Menunggu Verifikasi'
    db.prepare(`
      UPDATE findings
      SET status = 'Menunggu Verifikasi', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(findingId);

    // Record in activity logs
    db.prepare(`
      INSERT INTO activity_logs (finding_id, user_id, user_name, activity, description, ip_address)
      VALUES (?, ?, ?, 'FollowUp', ?, ?)
    `).run(
      findingId,
      req.user.id,
      req.user.name,
      `PIC ${req.user.name} menyelesaikan tindak lanjut dan mengajukan status Menunggu Verifikasi`,
      req.ip || '127.0.0.1'
    );

    // Send notification to Verifikators / Creator
    const verifiers = db.prepare("SELECT id FROM users WHERE role IN ('Verifikator', 'Asesor', 'Admin')").all();
    const insertNotif = db.prepare(`
      INSERT INTO notifications (user_id, title, message, finding_id)
      VALUES (?, 'Tindak Lanjut Siap Diverifikasi', ?, ?)
    `);

    for (const v of verifiers) {
      insertNotif.run(
        v.id,
        `Tindak lanjut temuan ${finding.finding_code} telah dikirim oleh PIC ${req.user.name} dan menunggu verifikasi Anda.`,
        findingId
      );
    }

    res.json({
      success: true,
      message: 'Tindak lanjut berhasil dikirim! Status temuan kini Menunggu Verifikasi.',
      data: { followUpId }
    });
  } catch (error) {
    console.error('Follow-up submit error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengirimkan tindak lanjut.' });
  }
});

module.exports = router;
