const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedDatabase() {
  console.log('Seeding SIMATAP UMM database...');

  // Check if users already exist
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count > 0) {
    console.log('Database already seeded with users.');
    return;
  }

  // Clear existing tables if any
  db.exec(`
    DELETE FROM notifications;
    DELETE FROM activity_logs;
    DELETE FROM verifications;
    DELETE FROM follow_ups;
    DELETE FROM attachments;
    DELETE FROM findings;
    DELETE FROM users;
  `);

  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordAsesor = await bcrypt.hash('asesor123', 10);
  const hashedPasswordPIC = await bcrypt.hash('pic123', 10);

  // Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (name, username, email, password, role, phone, department, address, profile_photo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const adminId = insertUser.run(
    'Administrator SIMATAP',
    'admin',
    'admin@umm.ac.id',
    hashedPasswordAdmin,
    'Admin',
    '081234567890',
    'Badan Penjaminan Mutu Internal (BPMI)',
    'Gedung Kuliah Bersama I Lantai 2, Kampus III UMM',
    ''
  ).lastInsertRowid;

  const asesorId = insertUser.run(
    'Asesor UMM',
    'asesor',
    'asesor@umm.ac.id',
    hashedPasswordAsesor,
    'Verifikator',
    '081398765432',
    'Tim Asesor Internal Mutu UMM',
    'GKB II Ruang Asesmen, Kampus III UMM',
    ''
  ).lastInsertRowid;

  const picSarprasId = insertUser.run(
    'Budi Santoso (Sarpras)',
    'pic_sarpras',
    'sarpras@umm.ac.id',
    hashedPasswordPIC,
    'PIC',
    '081122334455',
    'Biro Administrasi Umum & Sarana Prasarana',
    'Gedung Kantor Pusat Lantai 1, Kampus III UMM',
    ''
  ).lastInsertRowid;

  const picLabId = insertUser.run(
    'Dewi Lestari (Kepala Lab)',
    'pic_lab',
    'lab@umm.ac.id',
    hashedPasswordPIC,
    'PIC',
    '081223344556',
    'UPT Laboratorium Terpadu & Komputasi',
    'Gedung Lab Eksakta Lantai 3, Kampus III UMM',
    ''
  ).lastInsertRowid;

  const picAkademikId = insertUser.run(
    'Ahmad Fauzi (Akademik)',
    'pic_akademik',
    'akademik@umm.ac.id',
    hashedPasswordPIC,
    'PIC',
    '081334455667',
    'Biro Administrasi Akademik & Pengajaran',
    'GKB I Lantai 1, Kampus III UMM',
    ''
  ).lastInsertRowid;

  console.log('Users seeded successfully.');

  // Helper statement for findings
  const insertFinding = db.prepare(`
    INSERT INTO findings (
      finding_code, title, description, category, location, priority, status,
      finding_date, pic_id, target_date, created_by, notes, semester_period, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAttachment = db.prepare(`
    INSERT INTO attachments (finding_id, follow_up_id, file_name, file_url, file_type, file_size, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertFollowUp = db.prepare(`
    INSERT INTO follow_ups (finding_id, pic_id, description, action_date, status, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVerification = db.prepare(`
    INSERT INTO verifications (finding_id, verifier_id, decision, notes, verified_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertLog = db.prepare(`
    INSERT INTO activity_logs (finding_id, user_id, user_name, activity, description, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertNotif = db.prepare(`
    INSERT INTO notifications (user_id, title, message, finding_id, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Define 25 exact findings to match PRD numbers (Total: 25, Open: 10, Menunggu Verifikasi: 3, Close: 12)
  const findingsData = [
    {
      code: 'TM-2026-025',
      title: 'AC yang rusak di dalam LAB. E',
      desc: 'Ditemukan 2 unit pendingin ruangan (AC) di LAB. E tidak berfungsi dengan baik dan mengeluarkan suara bising saat praktikum berlangsung.',
      category: 'Sarana & Prasarana',
      location: 'LAB. E',
      priority: 'Tinggi',
      status: 'Open',
      date: '2026-07-02 10:30:00',
      pic: picLabId,
      notes: 'Perlu penggantian filter atau kompresor pendingin ruangan segera sebelum pekan ujian.',
      images: ['/images/ac_rusak.jpg']
    },
    {
      code: 'TM-2026-024',
      title: 'Metode pembelajaran interaktif dan media pembelajaran',
      desc: 'Ditemukan bahwa dalam proses pembelajaran di Ruang Kelas 403, metode penyampaian materi belum menggunakan media interaktif sehingga partisipasi mahasiswa relatif rendah.',
      category: 'Pembelajaran',
      location: 'Ruang Kelas 403',
      priority: 'Sedang',
      status: 'Menunggu Verifikasi',
      date: '2026-06-30 14:15:00',
      pic: picAkademikId,
      notes: 'Perlu dilakukan evaluasi metode pembelajaran dan pemanfaatan teknologi pendukung.',
      followUp: {
        desc: 'Telah diselenggarakan workshop mini micro-teaching dan pembagian modul media interaktif e-learning UMM bagi seluruh dosen pengampu di Ruang Kelas 403.',
        date: '2026-07-01 11:00:00',
        proof: '/images/ac_repaired.jpg',
        notes: 'Bukti daftar hadir dan link RPS interaktif sudah diunggah.'
      }
    },
    {
      code: 'TM-2026-023',
      title: 'Kelengkapan SOP dan dokumen mutu SPMI',
      desc: 'Beberapa dokumen standar operasional prosedur penjaminan mutu di Unit Penjaminan Mutu belum dimutakhirkan dengan format terbaru siklus PPEPP.',
      category: 'Dokumen',
      location: 'Unit Penjaminan Mutu',
      priority: 'Rendah',
      status: 'Close',
      date: '2026-06-28 09:10:00',
      pic: picAkademikId,
      notes: 'Dokumen revisi telah diverifikasi sesuai format SPMI 2026.',
      verified: { decision: 'Valid', notes: 'SOP dan dokumen mutu telah diperbarui lengkap dan disahkan oleh pimpinan.' }
    },
    {
      code: 'TM-2026-022',
      title: 'Kalibrasi peralatan uji laboratorium riset terpadu',
      desc: 'Instrumen spektrofotometer dan sentrifus pada Lab Riset belum memiliki sertifikat kalibrasi berkala tahun 2026.',
      category: 'Penelitian',
      location: 'Lab Riset',
      priority: 'Tinggi',
      status: 'Open',
      date: '2026-06-25 11:20:00',
      pic: picLabId,
      notes: 'Segera koordinasi dengan Balai Kalibrasi terakreditasi KAN.'
    },
    {
      code: 'TM-2026-021',
      title: 'Pencatatan luaran pengabdian masyarakat dosen',
      desc: 'Dokumentasi HKI dan publikasi media massa dari hasil pengabdian masyarakat dosen semester ganjil belum terarsip di sistem.',
      category: 'Pengabdian',
      location: 'Ruang Dosen',
      priority: 'Sedang',
      status: 'Close',
      date: '2026-06-24 13:45:00',
      pic: picAkademikId,
      notes: 'Seluruh luaran telah diinput ke SIM-LPPM.',
      verified: { decision: 'Valid', notes: 'Verifikasi arsip luaran lengkap 100%.' }
    },
    {
      code: 'TM-2026-020',
      title: 'Kondisi proyektor LCD dan konektor HDMI di LAB C',
      desc: 'Proyektor di LAB C redup dan kabel HDMI putus di bagian sambungan sehingga mengganggu presentasi mahasiswa.',
      category: 'Sarana & Prasarana',
      location: 'LAB C',
      priority: 'Rendah',
      status: 'Menunggu Verifikasi',
      date: '2026-06-22 15:30:00',
      pic: picSarprasId,
      notes: 'Menunggu penggantian lampu proyektor baru.',
      followUp: {
        desc: 'Telah diganti proyektor laser baru berdaya 3500 ANSI lumens dan kabel HDMI braided 10 meter.',
        date: '2026-06-23 10:00:00',
        proof: '/images/ac_repaired.jpg',
        notes: 'Sudah dites fungsi normal.'
      }
    },
    {
      code: 'TM-2026-019',
      title: 'Distribusi silabus dan RPS mata kuliah di Ruang Kelas 102',
      desc: 'Dosen belum mengunggah RPS terkini ke LMS Canvas sebelum perkuliahan minggu pertama dimulai.',
      category: 'Pembelajaran',
      location: 'Ruang Kelas 102',
      priority: 'Sedang',
      status: 'Open',
      date: '2026-06-20 10:00:00',
      pic: picAkademikId,
      notes: 'Diingatkan kepada Ketua Program Studi terkait.'
    },
    {
      code: 'TM-2026-018',
      title: 'Akses repository jurnal ilmiah di Perpustakaan Pusat',
      desc: 'Akses download repository karya akhir mahasiswa memerlukan update sertifikat SSL dan sinkronisasi server.',
      category: 'Dokumen',
      location: 'Perpustakaan',
      priority: 'Rendah',
      status: 'Close',
      date: '2026-06-18 09:00:00',
      pic: picLabId,
      notes: 'Sertifikat SSL dan konfigurasi Nginx selesai diperbarui.',
      verified: { decision: 'Valid', notes: 'Repository sudah dapat diakses lancar 24/7.' }
    },
    {
      code: 'TM-2026-017',
      title: 'Ketersediaan lisensi software statistik di Laboratorium Komputer',
      desc: 'Software SPSS dan Matlab di 30 PC Laboratorium Komputer memerlukan pembaruan serial activation token.',
      category: 'Penelitian',
      location: 'Laboratorium Komputer',
      priority: 'Tinggi',
      status: 'Open',
      date: '2026-06-16 11:45:00',
      pic: picLabId,
      notes: 'Menunggu proses aktivasi lisensi kampus.'
    },
    {
      code: 'TM-2026-016',
      title: 'Monitoring dan evaluasi mitra pengabdian desa binaan',
      desc: 'Form kepuasan mitra masyarakat di Desa Binaan Dau belum terisi lengkap pada logbook kegiatan.',
      category: 'Pengabdian',
      location: 'Ruang Meeting',
      priority: 'Sedang',
      status: 'Close',
      date: '2026-06-15 14:20:00',
      pic: picAkademikId,
      notes: 'Survei kepuasan mitra telah selesai dikompilasi.',
      verified: { decision: 'Valid dengan Catatan', notes: 'Disetujui dengan catatan perlu tindak lanjut semester depan.' }
    },
    {
      code: 'TM-2026-015',
      title: 'Kerusakan fasilitas kursi dan stopkontak ruang kelas',
      desc: 'Terdapat 8 unit kursi lipat kuliah patah dan 3 stopkontak longgar di lantai 3 GKB III.',
      category: 'Sarana & Prasarana',
      location: 'GKB III',
      priority: 'Sedang',
      status: 'Open',
      date: '2026-06-12 13:10:00',
      pic: picSarprasId,
      notes: 'Perlu perbaikan kursi dan penggantian stopkontak standar SNI.'
    },
    {
      code: 'TM-2026-014',
      title: 'Kesesuaian rubrik penilaian praktikum dengan CPL prodi',
      desc: 'Rubrik penilaian praktikum belum mencantumkan pemetaan Capaian Pembelajaran Lulusan (CPL) aspek psikomotorik.',
      category: 'Pembelajaran',
      location: 'LAB. E',
      priority: 'Tinggi',
      status: 'Menunggu Verifikasi',
      date: '2026-06-10 16:00:00',
      pic: picAkademikId,
      notes: 'Revisi rubrik telah diserahkan ke GJM fakultas.',
      followUp: {
        desc: 'Tim kurikulum telah menyelaraskan rubrik penilaian praktikum dengan matriks CPL dan OBE.',
        date: '2026-06-14 09:30:00',
        proof: '/images/ac_repaired.jpg',
        notes: 'Matriks pemetaan CPL lengkap terlampir.'
      }
    },
    {
      code: 'TM-2026-013',
      title: 'Arsip berita acara ujian skripsi belum terdigitalisasi',
      desc: 'Sebagian berkas berita acara ujian tugas akhir semester lalu masih berupa hardcopy dan belum diunggah ke SIMATAP.',
      category: 'Dokumen',
      location: 'Unit Penjaminan Mutu',
      priority: 'Sedang',
      status: 'Close',
      date: '2026-06-08 10:40:00',
      pic: picAkademikId,
      notes: 'Scan seluruh berkas telah selesai 100%.',
      verified: { decision: 'Valid', notes: 'Digitalisasi berkas lengkap.' }
    },
    {
      code: 'TM-2026-012',
      title: 'Kelengkapan lembar persetujuan etik penelitian (Ethical Clearance)',
      desc: 'Proposal penelitian dosen bidang biomedis belum melampirkan surat lolos kaji etik dari KEPK UMM.',
      category: 'Penelitian',
      location: 'Lab Riset',
      priority: 'Tinggi',
      status: 'Close',
      date: '2026-06-05 13:00:00',
      pic: picLabId,
      notes: 'Surat Ethical Clearance telah diterbitkan.',
      verified: { decision: 'Valid', notes: 'Semua berkas kaji etik telah tervalidasi.' }
    },
    {
      code: 'TM-2026-011',
      title: 'Dokumentasi keterlibatan mahasiswa dalam kegiatan pengabdian',
      desc: 'Presensi dan laporan kontribusi mahasiswa pada program pemberdayaan UMKM belum lengkap di sistem.',
      category: 'Pengabdian',
      location: 'Ruang Kelas 403',
      priority: 'Rendah',
      status: 'Open',
      date: '2026-06-02 11:15:00',
      pic: picAkademikId,
      notes: 'Meminta ketua pelaksana melengkapi berkas keterlibatan mahasiswa.'
    },
    {
      code: 'TM-2026-010',
      title: 'Penerangan koridor dan akses tangga darurat GKB II',
      desc: 'Dua lampu darurat LED di tangga evakuasi mati dan jalur evakuasi tertutup tumpukan kardus.',
      category: 'Sarana & Prasarana',
      location: 'GKB II',
      priority: 'Tinggi',
      status: 'Close',
      date: '2026-05-28 14:00:00',
      pic: picSarprasId,
      notes: 'Jalur evakuasi telah dibersihkan dan lampu diganti baru.',
      verified: { decision: 'Valid', notes: 'Pemeriksaan fisik menunjukkan jalur evakuasi aman dan terang.' }
    },
    {
      code: 'TM-2026-009',
      title: 'Ketersediaan hand sanitizer dan APD di Lab Kimia Terpadu',
      desc: 'Stok sarung tangan nitril dan masker pelindung uap organik di Lab Kimia menipis.',
      category: 'Sarana & Prasarana',
      location: 'LAB A',
      priority: 'Sedang',
      status: 'Close',
      date: '2026-05-25 10:20:00',
      pic: picLabId,
      notes: 'Pengadaan APD tambahan telah didistribusikan ke lemari keselamatan.',
      verified: { decision: 'Valid', notes: 'Stok APD sudah memenuhi standar K3 lab.' }
    },
    {
      code: 'TM-2026-008',
      title: 'Pemanfaatan sistem presensi berbasis QR code pada kuliah umum',
      desc: 'Mahasiswa mengalami kesulitan scan barcode saat kuliah umum gabungan di Aula GKB IV.',
      category: 'Pembelajaran',
      location: 'Aula GKB IV',
      priority: 'Rendah',
      status: 'Close',
      date: '2026-05-20 09:00:00',
      pic: picAkademikId,
      notes: 'Optimasi bandwidth access point dan update QR dynamic telah diaplikasikan.',
      verified: { decision: 'Valid', notes: 'Sistem presensi sudah lancar pada kegiatan berikutnya.' }
    },
    {
      code: 'TM-2026-007',
      title: 'Kelengkapan buku panduan akademik edisi 2025/2026',
      desc: 'Distribusi buku panduan akademik format digital belum terintegrasi di portal mahasiswa baru.',
      category: 'Dokumen',
      location: 'Unit Penjaminan Mutu',
      priority: 'Rendah',
      status: 'Open',
      date: '2026-05-15 15:10:00',
      pic: picAkademikId,
      notes: 'Sedang disusun edisi revisi bersama BAA.'
    },
    {
      code: 'TM-2026-006',
      title: 'Kebersihan filter air minum higienis di lantai 2 GKB I',
      desc: 'Indikator penggantian membran filter dispenser air minum gratis di koridor GKB I telah berwarna merah.',
      category: 'Sarana & Prasarana',
      location: 'GKB I',
      priority: 'Sedang',
      status: 'Close',
      date: '2026-05-10 11:30:00',
      pic: picSarprasId,
      notes: 'Cartridge filter 3 lapis telah diganti baru dan diuji TDS air normal.',
      verified: { decision: 'Valid', notes: 'Kualitas air aman dikonsumsi.' }
    },
    {
      code: 'TM-2026-005',
      title: 'Pembaruan kontrak kerjasama riset industri dengan PT Petrokimia',
      desc: 'Perjanjian kerjasama riset bersama industri perlu adendum masa berlaku hingga 2027.',
      category: 'Penelitian',
      location: 'Lab Riset',
      priority: 'Sedang',
      status: 'Close',
      date: '2026-04-22 13:40:00',
      pic: picLabId,
      notes: 'MoU dan MoA perpanjangan telah ditandatangani kedua belah pihak.',
      verified: { decision: 'Valid', notes: 'Dokumen kerjasama telah tercatat di Biro Kerjasama.' }
    },
    {
      code: 'TM-2026-004',
      title: 'Konektivitas WiFi eduroam di Ruang Baca Perpustakaan',
      desc: 'Sinyal WiFi sering putus-putus saat jam ramai pengunjung di lantai 3 perpustakaan.',
      category: 'Sarana & Prasarana',
      location: 'Perpustakaan',
      priority: 'Tinggi',
      status: 'Open',
      date: '2026-04-12 10:15:00',
      pic: picLabId,
      notes: 'Perlu penambahan 2 unit Access Point Wi-Fi 6 di sudut ruang baca.'
    },
    {
      code: 'TM-2026-003',
      title: 'Evaluasi kesesuaian soal UTS dengan kisi-kisi RPS',
      desc: 'Terdapat 2 mata kuliah prodi yang naskah soal UTS-nya belum diverifikasi oleh GJM sebelum diujikan.',
      category: 'Pembelajaran',
      location: 'Ruang Dosen',
      priority: 'Sedang',
      status: 'Close',
      date: '2026-03-20 14:00:00',
      pic: picAkademikId,
      notes: 'Form review soal UTS telah disahkan oleh Gugus Jaminan Mutu.',
      verified: { decision: 'Valid', notes: 'SOP review soal UTS telah ditegakkan dengan tertib.' }
    },
    {
      code: 'TM-2026-002',
      title: 'Ketersediaan papan informasi K3 di laboratorium bengkel mesin',
      desc: 'Petunjuk keselamatan kerja dan simbol bahaya di bengkel mekanik belum terpasang di dinding mesin bubut.',
      category: 'Sarana & Prasarana',
      location: 'LAB A',
      priority: 'Tinggi',
      status: 'Open',
      date: '2026-02-18 09:30:00',
      pic: picSarprasId,
      notes: 'Pemasangan signage safety K3 sedang dipesan ke bagian percetakan.'
    },
    {
      code: 'TM-2026-001',
      title: 'Kesesuaian kontrak belajar perkuliahan semester ganjil',
      desc: 'Penandatanganan kontrak belajar perkuliahan antara dosen dan komting kelas belum diarsipkan di arsip fakultas.',
      category: 'Pembelajaran',
      location: 'Ruang Kelas 102',
      priority: 'Rendah',
      status: 'Close',
      date: '2026-01-15 08:30:00',
      pic: picAkademikId,
      notes: 'Semua berkas kontrak belajar telah diarsipkan secara digital.',
      verified: { decision: 'Valid', notes: 'Arsip kontrak belajar telah diverifikasi lengkap.' }
    }
  ];

  console.log(`Inserting ${findingsData.length} findings...`);

  for (const item of findingsData) {
    const res = insertFinding.run(
      item.code,
      item.title,
      item.desc,
      item.category,
      item.location,
      item.priority,
      item.status,
      item.date,
      item.pic || picSarprasId,
      '2026-07-31',
      asesorId,
      item.notes || '',
      'Semester Genap 2025/2026',
      item.date,
      item.date
    );

    const findingId = res.lastInsertRowid;

    // Attach initial image
    insertAttachment.run(
      findingId,
      null,
      'bukti_temuan_asesmen.jpg',
      '/images/ac_rusak.jpg',
      'image/jpeg',
      1420500,
      item.date
    );

    // Initial creation log
    insertLog.run(
      findingId,
      asesorId,
      'Asesor UMM',
      'Create',
      `Asesor UMM membuat temuan baru: ${item.code}`,
      '127.0.0.1',
      item.date
    );

    // Follow-up if exists
    if (item.followUp) {
      const fuRes = insertFollowUp.run(
        findingId,
        item.pic,
        item.followUp.desc,
        item.followUp.date,
        'Menunggu Verifikasi',
        item.followUp.notes || '',
        item.followUp.date,
        item.followUp.date
      );

      insertAttachment.run(
        findingId,
        fuRes.lastInsertRowid,
        'bukti_tindak_lanjut.jpg',
        item.followUp.proof || '/images/ac_repaired.jpg',
        'image/jpeg',
        2105000,
        item.followUp.date
      );

      insertLog.run(
        findingId,
        item.pic,
        'PIC Temuan',
        'FollowUp',
        `PIC mengirim tindak lanjut perbaikan temuan`,
        '127.0.0.1',
        item.followUp.date
      );
    }

    // Verification if exists
    if (item.verified) {
      insertVerification.run(
        findingId,
        asesorId,
        item.verified.decision,
        item.verified.notes,
        item.date
      );

      insertLog.run(
        findingId,
        asesorId,
        'Asesor UMM',
        'Verify',
        `Asesor UMM memverifikasi temuan: Keputusan ${item.verified.decision}`,
        '127.0.0.1',
        item.date
      );
    }
  }

  // Add initial notifications
  insertNotif.run(asesorId, 'Temuan Baru Dibuat', 'Temuan TM-2026-025 di LAB. E telah berhasil didaftarkan.', 1, 0, '2026-07-02 10:31:00');
  insertNotif.run(asesorId, 'Tindak Lanjut Diajukan', 'PIC telah menyelesaikan tindak lanjut untuk TM-2026-024 (Menunggu Verifikasi).', 2, 0, '2026-07-01 11:05:00');
  insertNotif.run(asesorId, 'Tindak Lanjut Diajukan', 'PIC telah menyelesaikan tindak lanjut untuk TM-2026-020 (Menunggu Verifikasi).', 6, 0, '2026-06-23 10:05:00');

  console.log('Database seeded successfully with 25 realistic findings!');
}

module.exports = seedDatabase;

if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
