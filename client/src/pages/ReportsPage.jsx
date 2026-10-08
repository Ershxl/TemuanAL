import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  RotateCcw, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  ClipboardList, 
  Clock, 
  MessageSquareQuote, 
  CheckCircle2, 
  ChevronDown,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';

export function ReportsPage() {
  const { addToast } = useNotification();

  // Filters with real-time Date Period
  const [periodPreset, setPeriodPreset] = useState('Semester Genap 2025/2026');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-07-31');
  const [category, setCategory] = useState('Semua Kategori');
  const [location, setLocation] = useState('Semua Lokasi');
  const [status, setStatus] = useState('Semua Status');

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Preset Changes
  const handlePresetChange = (preset) => {
    setPeriodPreset(preset);
    if (preset === 'Semester Genap 2025/2026') {
      setStartDate('2026-01-01');
      setEndDate('2026-07-31');
    } else if (preset === 'Semester Ganjil 2025/2026') {
      setStartDate('2025-08-01');
      setEndDate('2025-12-31');
    } else if (preset === 'Tahun 2026') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    } else if (preset === 'Bulan Ini') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === 'Semua Periode') {
      setStartDate('');
      setEndDate('');
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports', {
        startDate: startDate || '',
        endDate: endDate || '',
        category: category !== 'Semua Kategori' ? category : '',
        location: location !== 'Semua Lokasi' ? location : '',
        status: status !== 'Semua Status' ? status : '',
      });
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Gagal memuat data laporan', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Real-time automatic update whenever any filter changes
  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, category, location, status]);

  const handleResetFilter = () => {
    handlePresetChange('Semester Genap 2025/2026');
    setCategory('Semua Kategori');
    setLocation('Semua Lokasi');
    setStatus('Semua Status');
  };

  const cards = reportData?.cards || {
    total: 25,
    open: 10,
    waiting: 3,
    close: 12
  };

  const categorySummary = reportData?.categorySummary || [
    { category: 'Sarana & Prasarana', total: 8, open: 3, waiting: 1, close: 4, percentClose: 50 },
    { category: 'Pembelajaran', total: 7, open: 3, waiting: 1, close: 3, percentClose: 43 },
    { category: 'Dokumen', total: 4, open: 1, waiting: 1, close: 2, percentClose: 50 },
    { category: 'Penelitian', total: 3, open: 2, waiting: 0, close: 1, percentClose: 33 },
    { category: 'Pengabdian', total: 3, open: 1, waiting: 0, close: 2, percentClose: 67 }
  ];

  const monthlyData = reportData?.monthlyData || [
    { name: 'Jan', jumlah: 4 },
    { name: 'Feb', jumlah: 6 },
    { name: 'Mar', jumlah: 8 },
    { name: 'Apr', jumlah: 5 },
    { name: 'Mei', jumlah: 12 },
    { name: 'Jun', jumlah: 15 },
    { name: 'Jul', jumlah: 7 },
  ];

  const statusDistribution = reportData?.statusDistribution || [
    { name: 'Open', value: 10, percent: 40, color: '#2563eb' },
    { name: 'Menunggu Verifikasi', value: 3, percent: 12, color: '#f59e0b' },
    { name: 'Close', value: 12, percent: 48, color: '#16a34a' }
  ];

  // Export to Excel (Client & Server Fallback)
  const handleExportExcel = () => {
    try {
      setShowExportMenu(false);
      const rows = categorySummary.map(item => ({
        'Kategori': item.category,
        'Total Temuan': item.total,
        'Temuan Open': item.open,
        'Menunggu Verifikasi': item.waiting,
        'Temuan Close': item.close,
        'Persentase Selesai (%)': `${item.percentClose}%`
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Ringkasan Laporan');
      XLSX.writeFile(wb, 'Laporan_Temuan_AL_UMM.xlsx');
      addToast('File Excel berhasil diekspor!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Gagal mengunduh Excel', 'error');
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    try {
      setShowExportMenu(false);
      const doc = new jsPDF();

      // Header Banner UMM
      doc.setFillColor(96, 5, 5); // #600505
      doc.rect(0, 0, 210, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('UNIVERSITAS MUHAMMADIYAH MALANG', 105, 12, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('SIMATAP UMM - Laporan Temuan Asesmen Lapangan', 105, 20, { align: 'center' });

      // Document Info
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      const periodeText = periodPreset === 'Kustom'
        ? `${startDate || '-'} s/d ${endDate || '-'}`
        : periodPreset;
      doc.text(`Periode: ${periodeText}`, 14, 38);
      doc.text(`Kategori: ${category}`, 14, 44);
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 50);

      // Summary Table
      const tableData = categorySummary.map((item, idx) => [
        idx + 1,
        item.category,
        item.total,
        item.open,
        item.waiting,
        item.close,
        `${item.percentClose}%`
      ]);

      // Add Total Row
      tableData.push([
        '',
        'TOTAL KESELURUHAN',
        cards.total,
        cards.open,
        cards.waiting,
        cards.close,
        `${cards.total > 0 ? Math.round((cards.close / cards.total) * 100) : 0}%`
      ]);

      doc.autoTable({
        startY: 56,
        head: [['No', 'Kategori', 'Total', 'Open', 'Menunggu Verif', 'Close', '% Close']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [96, 5, 5], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3.5 },
      });

      // Signature Area
      const finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(10);
      doc.text('Malang, ' + new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }), 140, finalY);
      doc.text('Kepala Penjaminan Mutu Internal UMM', 140, finalY + 6);
      doc.text('(..................................................)', 140, finalY + 30);

      doc.save('Laporan_Temuan_AL_SIMATAP_UMM.pdf');
      addToast('Laporan PDF berhasil diunduh!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Gagal membuat PDF', 'error');
    }
  };

  const periodeDisplay = periodPreset === 'Kustom'
    ? `${startDate || '-'} s/d ${endDate || '-'}`
    : periodPreset;

  return (
    <div className="space-y-6">
      {/* Real-time period header banner */}
      <div className="bg-gradient-to-r from-[#600505] to-[#8B0A0A] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <p className="text-red-200 text-xs font-semibold uppercase tracking-widest mb-0.5">Laporan Temuan</p>
          <h2 className="text-white text-base sm:text-lg font-bold leading-tight">SIMATAP UMM – Laporan Asesmen Lapangan</h2>
          <p className="text-red-200/80 text-xs mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Periode aktif: <span className="font-bold text-white">{periodeDisplay}</span></span>
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-0.5 flex-shrink-0 bg-white/10 rounded-xl px-4 py-3">
          <span className="text-white text-xl font-black tabular-nums tracking-tight">
            {currentDateTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-red-200 text-xs font-medium">
            {currentDateTime.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* 1. Filter Laporan Card */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Filter className="w-4 h-4 text-[#600505]" />
          <h3 className="font-bold text-gray-900 text-sm">Filter Laporan</h3>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Preset Periode */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Preset Periode</label>
            <select
              value={periodPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden font-medium"
            >
              <option value="Semester Genap 2025/2026">Semester Genap 2025/2026</option>
              <option value="Semester Ganjil 2025/2026">Semester Ganjil 2025/2026</option>
              <option value="Tahun 2026">Tahun 2026 Penuh</option>
              <option value="Bulan Ini">Bulan Ini</option>
              <option value="Kustom">Kustom Tanggal</option>
              <option value="Semua Periode">Semua Periode</option>
            </select>
          </div>

          {/* Tanggal Mulai */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Tanggal Mulai</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPeriodPreset('Kustom');
                }}
                className="w-full pl-2.5 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Tanggal Akhir */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Tanggal Selesai</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPeriodPreset('Kustom');
                }}
                className="w-full pl-2.5 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
            >
              <option value="Semua Kategori">Semua Kategori</option>
              <option value="Sarana & Prasarana">Sarana & Prasarana</option>
              <option value="Pembelajaran">Pembelajaran</option>
              <option value="Dokumen">Dokumen</option>
              <option value="Penelitian">Penelitian</option>
              <option value="Pengabdian">Pengabdian</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Lokasi</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
            >
              <option value="Semua Lokasi">Semua Lokasi</option>
              <option value="LAB. E">LAB. E</option>
              <option value="LAB A">LAB A</option>
              <option value="LAB C">LAB C</option>
              <option value="GKB I">GKB I</option>
              <option value="GKB II">GKB II</option>
              <option value="GKB III">GKB III</option>
              <option value="Ruang Kelas 403">Ruang Kelas 403</option>
              <option value="Ruang Kelas 102">Ruang Kelas 102</option>
              <option value="Perpustakaan">Perpustakaan</option>
              <option value="Lab Riset">Lab Riset</option>
              <option value="Unit Penjaminan Mutu">Unit Penjaminan Mutu</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Open">Open</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Close">Close</option>
            </select>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={fetchReports}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#600505] hover:bg-[#730606] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Terapkan Filter</span>
            </button>
            <button
              onClick={handleResetFilter}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs font-medium rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative w-full sm:w-auto ml-auto">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg shadow-xs transition-colors w-full sm:w-auto cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Laporan</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 animate-fade-in">
                <button
                  onClick={handleExportPDF}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-[#600505] flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>Export PDF (.pdf)</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export Excel (.xlsx)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Four Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Temuan */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-semibold">Total Temuan</div>
            <div className="text-2xl font-bold text-gray-900">{cards.total}</div>
            <div className="text-[10px] text-gray-400">Semua temuan</div>
          </div>
        </div>

        {/* Temuan Open */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-semibold">Temuan Open</div>
            <div className="text-2xl font-bold text-gray-900">{cards.open}</div>
            <div className="text-[10px] text-gray-400">Belum ditindaklanjuti</div>
          </div>
        </div>

        {/* Menunggu Verifikasi */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <MessageSquareQuote className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-semibold">Menunggu Verifikasi</div>
            <div className="text-2xl font-bold text-gray-900">{cards.waiting}</div>
            <div className="text-[10px] text-gray-400">Perlu verifikasi asesor</div>
          </div>
        </div>

        {/* Temuan Close */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-semibold">Temuan Close</div>
            <div className="text-2xl font-bold text-gray-900">{cards.close}</div>
            <div className="text-[10px] text-gray-400">Sudah ditindaklanjuti</div>
          </div>
        </div>
      </div>

      {/* 3. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-xs">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">Grafik Temuan per Bulan</h3>
          <p className="text-xs text-gray-400 mb-4">Jumlah temuan berdasarkan periode bulan</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="jumlah" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={26} label={{ position: 'top', fill: '#64748b', fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-3 h-3 bg-blue-600 rounded-xs"></span>
            <span className="text-xs text-gray-600 font-medium">Jumlah Temuan</span>
          </div>
        </div>

        {/* Right: Donut Chart (1 Col) */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">Distribusi Status Temuan</h3>
            <p className="text-xs text-gray-400 mt-0.5">Persentase status asesmen</p>
          </div>

          <div className="h-44 w-full relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-gray-50 pt-3 text-xs">
            {statusDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">
                  {item.value} ({item.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Ringkasan Temuan Table (Category breakdown matching prototype) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">Ringkasan Temuan</h3>
          <p className="text-xs text-gray-500">Rekapitulasi temuan dan persentase penyelesaian per kategori</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Kategori</th>
                <th className="py-3.5 px-4 text-center">Total Temuan</th>
                <th className="py-3.5 px-4 text-center">Open</th>
                <th className="py-3.5 px-4 text-center">Menunggu Verifikasi</th>
                <th className="py-3.5 px-4 text-center">Close</th>
                <th className="py-3.5 px-6">Persentase Close</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {categorySummary.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-gray-900">{row.category}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-gray-800">{row.total}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-blue-600">{row.open}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-amber-600">{row.waiting}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">{row.close}</td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <span className="w-10 font-bold text-gray-900">{row.percentClose}%</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden max-w-[140px]">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${row.percentClose}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3.5 bg-gray-50/40 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>Menampilkan 1 - 5 dari 5 data</div>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded bg-[#600505] text-white font-semibold">1</button>
          </div>
        </div>
      </div>
    </div>
  );
}
