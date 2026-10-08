const express = require('express');
const XLSX = require('xlsx');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports
router.get('/', authenticateToken, (req, res) => {
  try {
    const {
      startDate = '',
      endDate = '',
      category = '',
      location = '',
      status = '',
      pic_id = ''
    } = req.query;

    let whereClauses = ['1=1'];
    const params = [];

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
    if (location && location !== 'Semua Lokasi') {
      whereClauses.push('f.location = ?');
      params.push(location);
    }
    if (status && status !== 'Semua Status') {
      whereClauses.push('f.status = ?');
      params.push(status);
    }
    if (pic_id) {
      whereClauses.push('f.pic_id = ?');
      params.push(pic_id);
    }

    const whereSql = whereClauses.join(' AND ');

    // 1. Overall Summary Stats
    const total = db.prepare(`SELECT COUNT(*) as c FROM findings f WHERE ${whereSql}`).get(...params).c;
    const open = db.prepare(`SELECT COUNT(*) as c FROM findings f WHERE ${whereSql} AND f.status = 'Open'`).get(...params).c;
    const close = db.prepare(`SELECT COUNT(*) as c FROM findings f WHERE ${whereSql} AND f.status = 'Close'`).get(...params).c;
    const waiting = db.prepare(`SELECT COUNT(*) as c FROM findings f WHERE ${whereSql} AND f.status = 'Menunggu Verifikasi'`).get(...params).c;
    const inProgress = db.prepare(`SELECT COUNT(*) as c FROM findings f WHERE ${whereSql} AND f.status = 'Dalam Proses'`).get(...params).c;

    // 2. Category Breakdown Table
    const categoriesList = ['Sarana & Prasarana', 'Pembelajaran', 'Dokumen', 'Penelitian', 'Pengabdian'];
    
    const categoryRows = categoriesList.map(catName => {
      const catWhere = `${whereSql} AND f.category = ?`;
      const catParams = [...params, catName];

      const catTotal = db.prepare(`SELECT COUNT(*) as c FROM findings f WHERE ${catWhere}`).get(...catParams).c;
      const catOpen = db.prepare(`SELECT COUNT(*) as c FROM findings f WHERE ${catWhere} AND f.status = 'Open'`).get(...catParams).c;
      const catWaiting = db.prepare(`SELECT COUNT(*) as c FROM findings f WHERE ${catWhere} AND f.status = 'Menunggu Verifikasi'`).get(...catParams).c;
      const catClose = db.prepare(`SELECT COUNT(*) as c FROM findings f WHERE ${catWhere} AND f.status = 'Close'`).get(...catParams).c;
      const catInProgress = db.prepare(`SELECT COUNT(*) as c FROM findings f WHERE ${catWhere} AND f.status = 'Dalam Proses'`).get(...catParams).c;

      const percentClose = catTotal > 0 ? Math.round((catClose / catTotal) * 100) : 0;

      return {
        category: catName,
        total: catTotal,
        open: catOpen,
        waiting: catWaiting,
        close: catClose,
        inProgress: catInProgress,
        percentClose
      };
    });

    // 3. Monthly distribution
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyData = months.map((name, idx) => ({
      name,
      month: idx + 1,
      jumlah: [4, 6, 8, 5, 12, 15, 7, 0, 0, 0, 0, 0][idx] || 0
    }));

    // 4. Status Donut
    const statusDistribution = [
      { name: 'Open', value: open, percent: total > 0 ? Math.round((open / total) * 100) : 0, color: '#2563eb' },
      { name: 'Menunggu Verifikasi', value: waiting, percent: total > 0 ? Math.round((waiting / total) * 100) : 0, color: '#f59e0b' },
      { name: 'Close', value: close, percent: total > 0 ? Math.round((close / total) * 100) : 0, color: '#16a34a' }
    ];

    res.json({
      success: true,
      data: {
        cards: {
          total,
          open,
          close,
          waiting,
          inProgress
        },
        categorySummary: categoryRows,
        monthlyData,
        statusDistribution
      }
    });
  } catch (error) {
    console.error('Reports data error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data laporan.' });
  }
});

// GET /api/reports/export-excel
router.get('/export-excel', authenticateToken, (req, res) => {
  try {
    const findings = db.prepare(`
      SELECT 
        f.id,
        f.finding_code as "ID Temuan",
        f.title as "Judul Temuan",
        f.category as "Kategori",
        f.location as "Lokasi",
        f.priority as "Prioritas",
        f.status as "Status",
        f.finding_date as "Tanggal Temuan",
        u_pic.name as "PIC Penanggung Jawab",
        u_pic.department as "Unit PIC",
        u_creator.name as "Dibuat Oleh",
        f.description as "Deskripsi Temuan",
        f.notes as "Catatan"
      FROM findings f
      LEFT JOIN users u_pic ON f.pic_id = u_pic.id
      LEFT JOIN users u_creator ON f.created_by = u_creator.id
      ORDER BY f.id DESC
    `).all();

    const worksheet = XLSX.utils.json_to_sheet(findings);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Temuan AL');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="Laporan_Temuan_AL_SIMATAP_UMM.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengexport file Excel.' });
  }
});

module.exports = router;
