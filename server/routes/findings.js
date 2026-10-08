const express = require('express');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Helper to generate next TM-YYYY-XXX code
function generateFindingCode() {
  const currentYear = new Date().getFullYear();
  const prefix = `TM-${currentYear}-`;
  
  const lastFinding = db.prepare(`
    SELECT finding_code FROM findings
    WHERE finding_code LIKE ?
    ORDER BY id DESC LIMIT 1
  `).get(`${prefix}%`);

  let nextSeq = 1;
  if (lastFinding && lastFinding.finding_code) {
    const parts = lastFinding.finding_code.split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num)) nextSeq = num + 1;
    }
  }

  return `${prefix}${String(nextSeq).padStart(3, '0')}`;
}

// GET /api/findings
router.get('/', authenticateToken, (req, res) => {
  try {
    const {
      search = '',
      category = '',
      status = '',
      location = '',
      period = '',
      priority = '',
      pic_id = '',
      startDate = '',
      endDate = '',
      page = 1,
      limit = 10,
      sortBy = 'id',
      order = 'DESC'
    } = req.query;

    let whereClauses = ['1=1'];
    const params = [];

    // PIC role only sees findings assigned to them if role is PIC, or if specifically filtered
    if (req.user.role === 'PIC' && !req.query.all) {
      whereClauses.push('f.pic_id = ?');
      params.push(req.user.id);
    } else if (pic_id) {
      whereClauses.push('f.pic_id = ?');
      params.push(pic_id);
    }

    if (search.trim()) {
      whereClauses.push('(f.finding_code LIKE ? OR f.title LIKE ? OR f.description LIKE ? OR f.location LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (startDate) {
      whereClauses.push('f.finding_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereClauses.push('f.finding_date <= ?');
      params.push(endDate + ' 23:59:59');
    }

    if (category && category !== 'Semua Kategori') {
      whereClauses.push('f.category = ?');
      params.push(category);
    }

    if (status && status !== 'Semua Status') {
      whereClauses.push('f.status = ?');
      params.push(status);
    }

    if (location && location !== 'Semua Lokasi') {
      whereClauses.push('f.location = ?');
      params.push(location);
    }

    if (period && period !== 'Semua Periode') {
      whereClauses.push('f.semester_period = ?');
      params.push(period);
    }

    if (priority && priority !== 'Semua Prioritas') {
      whereClauses.push('f.priority = ?');
      params.push(priority);
    }

    const whereSql = whereClauses.join(' AND ');

    // Total count for current filter
    const countRow = db.prepare(`
      SELECT COUNT(*) as count
      FROM findings f
      WHERE ${whereSql}
    `).get(...params);

    const total = countRow.count;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    // Fetch findings with user joins
    const items = db.prepare(`
      SELECT 
        f.*,
        u_pic.name as pic_name,
        u_pic.department as pic_department,
        u_creator.name as creator_name
      FROM findings f
      LEFT JOIN users u_pic ON f.pic_id = u_pic.id
      LEFT JOIN users u_creator ON f.created_by = u_creator.id
      WHERE ${whereSql}
      ORDER BY f.id ${order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset);

    // Summary counts for stats cards
    // If PIC, base summary counts on PIC's items; otherwise whole database
    let baseWhere = '1=1';
    let baseParams = [];
    if (req.user.role === 'PIC' && !req.query.all) {
      baseWhere = 'pic_id = ?';
      baseParams = [req.user.id];
    }

    const stats = {
      total: db.prepare(`SELECT COUNT(*) as c FROM findings WHERE ${baseWhere}`).get(...baseParams).c,
      open: db.prepare(`SELECT COUNT(*) as c FROM findings WHERE ${baseWhere} AND status = 'Open'`).get(...baseParams).c,
      waiting: db.prepare(`SELECT COUNT(*) as c FROM findings WHERE ${baseWhere} AND status = 'Menunggu Verifikasi'`).get(...baseParams).c,
      close: db.prepare(`SELECT COUNT(*) as c FROM findings WHERE ${baseWhere} AND status = 'Close'`).get(...baseParams).c,
      in_progress: db.prepare(`SELECT COUNT(*) as c FROM findings WHERE ${baseWhere} AND status = 'Dalam Proses'`).get(...baseParams).c
    };

    res.json({
      success: true,
      data: items,
      stats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)) || 1
      }
    });
  } catch (error) {
    console.error('Fetch findings error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar temuan.' });
  }
});

// GET /api/findings/:id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const finding = db.prepare(`
      SELECT 
        f.*,
        u_pic.name as pic_name,
        u_pic.email as pic_email,
        u_pic.phone as pic_phone,
        u_pic.department as pic_department,
        u_pic.role as pic_role,
        u_creator.name as creator_name,
        u_creator.role as creator_role
      FROM findings f
      LEFT JOIN users u_pic ON f.pic_id = u_pic.id
      LEFT JOIN users u_creator ON f.created_by = u_creator.id
      WHERE f.id = ? OR f.finding_code = ?
    `).get(id, id);

    if (!finding) {
      return res.status(404).json({ success: false, message: 'Data temuan tidak ditemukan.' });
    }

    // Fetch attachments
    const attachments = db.prepare(`
      SELECT * FROM attachments WHERE finding_id = ? ORDER BY created_at ASC
    `).all(finding.id);

    // Fetch follow ups
    const followUps = db.prepare(`
      SELECT fu.*, u.name as pic_name, u.role as pic_role
      FROM follow_ups fu
      LEFT JOIN users u ON fu.pic_id = u.id
      WHERE fu.finding_id = ?
      ORDER BY fu.created_at DESC
    `).all(finding.id);

    // Fetch verifications
    const verifications = db.prepare(`
      SELECT v.*, u.name as verifier_name, u.role as verifier_role
      FROM verifications v
      LEFT JOIN users u ON v.verifier_id = u.id
      WHERE v.finding_id = ?
      ORDER BY v.verified_at DESC
    `).all(finding.id);

    // Fetch activity logs
    const activityLogs = db.prepare(`
      SELECT * FROM activity_logs WHERE finding_id = ? ORDER BY created_at DESC
    `).all(finding.id);

    res.json({
      success: true,
      data: {
        ...finding,
        attachments,
        follow_ups: followUps,
        verifications,
        activity_logs: activityLogs
      }
    });
  } catch (error) {
    console.error('Fetch finding detail error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail temuan.' });
  }
});

// POST /api/findings
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      priority,
      finding_date,
      pic_id,
      target_date,
      notes = '',
      status = 'Open',
      semester_period = 'Semester Genap 2025/2026',
      attachments = []
    } = req.body;

    if (!title || !description || !category || !location || !priority || !finding_date) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi semua kolom wajib (Judul, Deskripsi, Kategori, Lokasi, Prioritas, Tanggal).'
      });
    }

    const finding_code = generateFindingCode();
    const created_by = req.user.id;

    const result = db.prepare(`
      INSERT INTO findings (
        finding_code, title, description, category, location, priority, status,
        finding_date, pic_id, target_date, created_by, notes, semester_period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      finding_code,
      title,
      description,
      category,
      location,
      priority,
      status || 'Open',
      finding_date,
      pic_id || null,
      target_date || null,
      created_by,
      notes,
      semester_period
    );

    const findingId = result.lastInsertRowid;

    // Attach uploaded attachments if any
    if (Array.isArray(attachments) && attachments.length > 0) {
      const insertAtt = db.prepare(`
        INSERT INTO attachments (finding_id, file_name, file_url, file_type, file_size)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const att of attachments) {
        insertAtt.run(
          findingId,
          att.name || 'lampiran.jpg',
          att.url || '/images/ac_rusak.jpg',
          att.type || 'image/jpeg',
          att.size || 1024 * 1024
        );
      }
    } else {
      // Default sample attachment for realism
      db.prepare(`
        INSERT INTO attachments (finding_id, file_name, file_url, file_type, file_size)
        VALUES (?, 'bukti_awal_temuan.jpg', '/images/ac_rusak.jpg', 'image/jpeg', 1420500)
      `).run(findingId);
    }

    // Log creation
    db.prepare(`
      INSERT INTO activity_logs (finding_id, user_id, user_name, activity, description, ip_address)
      VALUES (?, ?, ?, 'Create', ?, ?)
    `).run(
      findingId,
      req.user.id,
      req.user.name,
      `${req.user.name} membuat temuan baru: ${finding_code} (${title})`,
      req.ip || '127.0.0.1'
    );

    // Notify PIC if assigned
    if (pic_id) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, finding_id)
        VALUES (?, 'Penugasan Temuan Baru', ?, ?)
      `).run(
        pic_id,
        `Anda ditugaskan sebagai PIC untuk temuan ${finding_code} di ${location}.`,
        findingId
      );
    }

    res.status(201).json({
      success: true,
      message: `Temuan ${finding_code} berhasil dibuat!`,
      data: { id: findingId, finding_code }
    });
  } catch (error) {
    console.error('Create finding error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat temuan.' });
  }
});

// PUT /api/findings/:id/status
router.put('/:id/status', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['Open', 'Ditugaskan', 'Dalam Proses', 'Menunggu Verifikasi', 'Perlu Perbaikan', 'Close'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid.' });
    }

    const finding = db.prepare('SELECT * FROM findings WHERE id = ?').get(id);
    if (!finding) {
      return res.status(404).json({ success: false, message: 'Temuan tidak ditemukan.' });
    }

    db.prepare(`
      UPDATE findings
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, id);

    // Log status change
    db.prepare(`
      INSERT INTO activity_logs (finding_id, user_id, user_name, activity, description, ip_address)
      VALUES (?, ?, ?, 'StatusChange', ?, ?)
    `).run(
      id,
      req.user.id,
      req.user.name,
      `Status diubah dari '${finding.status}' menjadi '${status}' oleh ${req.user.name}${notes ? `. Catatan: ${notes}` : ''}`,
      req.ip || '127.0.0.1'
    );

    res.json({ success: true, message: `Status berhasil diubah menjadi ${status}.` });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status temuan.' });
  }
});

// PUT /api/findings/:id (Update finding / assign PIC)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, location, priority, pic_id, target_date, notes } = req.body;

    const finding = db.prepare('SELECT * FROM findings WHERE id = ?').get(id);
    if (!finding) {
      return res.status(404).json({ success: false, message: 'Temuan tidak ditemukan.' });
    }

    db.prepare(`
      UPDATE findings
      SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        location = COALESCE(?, location),
        priority = COALESCE(?, priority),
        pic_id = COALESCE(?, pic_id),
        target_date = COALESCE(?, target_date),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description, category, location, priority, pic_id, target_date, notes, id);

    // Log update
    db.prepare(`
      INSERT INTO activity_logs (finding_id, user_id, user_name, activity, description, ip_address)
      VALUES (?, ?, ?, 'Update', ?, ?)
    `).run(
      id,
      req.user.id,
      req.user.name,
      `${req.user.name} memperbarui data temuan ${finding.finding_code}`,
      req.ip || '127.0.0.1'
    );

    res.json({ success: true, message: 'Data temuan berhasil diperbarui.' });
  } catch (error) {
    console.error('Update finding error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data temuan.' });
  }
});

module.exports = router;
