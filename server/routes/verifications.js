const express = require('express');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/verifications/pending
router.get('/pending', authenticateToken, (req, res) => {
  try {
    const pendingFindings = db.prepare(`
      SELECT 
        f.*,
        u_pic.name as pic_name,
        u_pic.department as pic_department,
        u_creator.name as creator_name
      FROM findings f
      LEFT JOIN users u_pic ON f.pic_id = u_pic.id
      LEFT JOIN users u_creator ON f.created_by = u_creator.id
      WHERE f.status = 'Menunggu Verifikasi'
      ORDER BY f.updated_at DESC
    `).all();

    res.json({ success: true, data: pendingFindings });
  } catch (error) {
    console.error('Fetch pending verifications error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar temuan menunggu verifikasi.' });
  }
});

// POST /api/verifications/:findingId
router.post('/:findingId', authenticateToken, requireRole('Verifikator', 'Asesor', 'Admin'), (req, res) => {
  try {
    const { findingId } = req.params;
    const { decision, notes = '' } = req.body;

    if (!decision || !['Valid', 'Valid dengan Catatan', 'Tidak Valid'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Pilih keputusan verifikasi yang valid (Valid, Valid dengan Catatan, atau Tidak Valid).' });
    }

    const finding = db.prepare('SELECT * FROM findings WHERE id = ?').get(findingId);
    if (!finding) {
      return res.status(404).json({ success: false, message: 'Data temuan tidak ditemukan.' });
    }

    // Insert verification record
    const result = db.prepare(`
      INSERT INTO verifications (finding_id, verifier_id, decision, notes)
      VALUES (?, ?, ?, ?)
    `).run(findingId, req.user.id, decision, notes);

    // Determine new status
    let newStatus = 'Close';
    if (decision === 'Tidak Valid') {
      newStatus = 'Perlu Perbaikan';
    }

    // Update finding status
    db.prepare(`
      UPDATE findings
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatus, findingId);

    // Log verification activity
    db.prepare(`
      INSERT INTO activity_logs (finding_id, user_id, user_name, activity, description, ip_address)
      VALUES (?, ?, ?, 'Verify', ?, ?)
    `).run(
      findingId,
      req.user.id,
      req.user.name,
      `Verifikator ${req.user.name} memberikan keputusan: ${decision} (${newStatus})${notes ? `. Catatan: ${notes}` : ''}`,
      req.ip || '127.0.0.1'
    );

    // Notify PIC
    if (finding.pic_id) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, finding_id)
        VALUES (?, 'Hasil Verifikasi Temuan', ?, ?)
      `).run(
        finding.pic_id,
        `Temuan ${finding.finding_code} telah diverifikasi oleh ${req.user.name}. Hasil: ${decision} (Status: ${newStatus}).`,
        findingId
      );
    }

    res.json({
      success: true,
      message: `Verifikasi berhasil disimpan. Status temuan menjadi ${newStatus}.`,
      data: { verificationId: result.lastInsertRowid, status: newStatus }
    });
  } catch (error) {
    console.error('Verification submit error:', error);
    res.status(500).json({ success: false, message: 'Gagal memproses verifikasi.' });
  }
});

module.exports = router;
