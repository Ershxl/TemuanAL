import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  RotateCcw, 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  ClipboardList, 
  Clock, 
  MessageSquareQuote, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Modal } from '../components/common/Modal';

export function FindingsListPage({ navigate, initialStatusFilter = '' }) {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const isPIC = user?.role === 'PIC';

  // Filters state
  const [period, setPeriod] = useState('Semester Genap 2025/2026');
  const [category, setCategory] = useState('Semua Kategori');
  const [status, setStatus] = useState(initialStatusFilter || 'Semua Status');
  const [location, setLocation] = useState('Semua Lokasi');
  const [search, setSearch] = useState('');

  // Table & pagination state
  const [findings, setFindings] = useState([]);
  const [stats, setStats] = useState({ total: 25, open: 10, waiting: 3, close: 12 });
  const [pagination, setPagination] = useState({ total: 25, page: 1, limit: 10, totalPages: 3 });
  const [loading, setLoading] = useState(false);

  // Quick Status Edit Modal
  const [statusModalItem, setStatusModalItem] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchFindings = async (pageToFetch = 1) => {
    try {
      setLoading(true);
      const params = {
        page: pageToFetch,
        limit: 10,
        period: period !== 'Semua Periode' ? period : '',
        category: category !== 'Semua Kategori' ? category : '',
        status: status !== 'Semua Status' ? status : '',
        location: location !== 'Semua Lokasi' ? location : '',
        search: search.trim(),
      };

      const res = await api.get('/findings', params);
      if (res.success) {
        setFindings(res.data);
        if (res.stats) setStats(res.stats);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
      addToast('Gagal memuat daftar temuan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings(1);
  }, [period, category, status, location]);

  const handleApplyFilter = (e) => {
    e?.preventDefault();
    fetchFindings(1);
  };

  const handleResetFilter = () => {
    setPeriod('Semua Periode');
    setCategory('Semua Kategori');
    setStatus('Semua Status');
    setLocation('Semua Lokasi');
    setSearch('');
  };

  const handleCardClick = (statStatus) => {
    setStatus(statStatus || 'Semua Status');
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalItem || !newStatus) return;
    try {
      setIsUpdatingStatus(true);
      await api.put(`/findings/${statusModalItem.id}/status`, {
        status: newStatus,
        notes: statusNotes
      });
      addToast(`Status temuan ${statusModalItem.finding_code} berhasil diubah ke ${newStatus}`, 'success');
      setStatusModalItem(null);
      fetchFindings(pagination.page);
    } catch (err) {
      addToast(err.message || 'Gagal mengubah status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Filter Temuan Card */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#600505]" />
            <h3 className="font-bold text-gray-900 text-sm">Filter Temuan</h3>
          </div>
          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
              placeholder="Cari temuan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#600505]"
            />
          </div>
        </div>

        {/* 4 Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Periode</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
            >
              <option value="Semester Genap 2025/2026">Semester Genap 2025/2026</option>
              <option value="Semester Ganjil 2025/2026">Semester Ganjil 2025/2026</option>
              <option value="Semua Periode">Semua Periode</option>
            </select>
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
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Perlu Perbaikan">Perlu Perbaikan</option>
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
              <option value="Ruang Dosen">Ruang Dosen</option>
              <option value="Laboratorium Komputer">Laboratorium Komputer</option>
              <option value="Ruang Meeting">Ruang Meeting</option>
            </select>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleApplyFilter}
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

          {!isPIC && (
            <button
              onClick={() => navigate('/findings/create')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#600505] hover:bg-[#730606] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer w-full sm:w-auto ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Temuan</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Four Mini Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => handleCardClick('')}
          className={`p-4 rounded-xl border bg-white flex items-center gap-3 cursor-pointer hover:shadow-xs transition-all ${
            status === 'Semua Status' ? 'border-[#600505] ring-1 ring-[#600505]' : 'border-gray-100'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-gray-500 font-medium">Total Temuan</div>
            <div className="text-xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-[10px] text-gray-400">Semua temuan</div>
          </div>
        </div>

        <div
          onClick={() => handleCardClick('Open')}
          className={`p-4 rounded-xl border bg-white flex items-center gap-3 cursor-pointer hover:shadow-xs transition-all ${
            status === 'Open' ? 'border-[#600505] ring-1 ring-[#600505]' : 'border-gray-100'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-gray-500 font-medium">Open</div>
            <div className="text-xl font-bold text-gray-900">{stats.open}</div>
            <div className="text-[10px] text-gray-400">Belum ditindaklanjuti</div>
          </div>
        </div>

        <div
          onClick={() => handleCardClick('Menunggu Verifikasi')}
          className={`p-4 rounded-xl border bg-white flex items-center gap-3 cursor-pointer hover:shadow-xs transition-all ${
            status === 'Menunggu Verifikasi' ? 'border-[#600505] ring-1 ring-[#600505]' : 'border-gray-100'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <MessageSquareQuote className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-gray-500 font-medium">Menunggu Verifikasi</div>
            <div className="text-xl font-bold text-gray-900">{stats.waiting}</div>
            <div className="text-[10px] text-gray-400">Perlu verifikasi asesor</div>
          </div>
        </div>

        <div
          onClick={() => handleCardClick('Close')}
          className={`p-4 rounded-xl border bg-white flex items-center gap-3 cursor-pointer hover:shadow-xs transition-all ${
            status === 'Close' ? 'border-[#600505] ring-1 ring-[#600505]' : 'border-gray-100'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-gray-500 font-medium">Close</div>
            <div className="text-xl font-bold text-gray-900">{stats.close}</div>
            <div className="text-[10px] text-gray-400">Sudah ditindaklanjuti</div>
          </div>
        </div>
      </div>

      {/* 3. Daftar Semua Temuan Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">Daftar Semua Temuan</h3>
          <span className="text-xs text-gray-500">Total {pagination.total} data</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">ID Temuan</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Lokasi</th>
                <th className="py-3.5 px-4">Prioritas</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Tanggal Temuan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    <div className="w-6 h-6 border-2 border-brand-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Memuat data temuan...
                  </td>
                </tr>
              ) : findings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="text-gray-400 text-sm font-medium">Tidak ada data temuan yang sesuai kriteria filter.</div>
                    <button
                      onClick={handleResetFilter}
                      className="mt-3 text-xs text-[#600505] hover:underline font-semibold"
                    >
                      Reset Filter
                    </button>
                  </td>
                </tr>
              ) : (
                findings.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#600505]">
                      <button
                        onClick={() => navigate(`/findings/${row.id}`)}
                        className="hover:underline font-bold text-left"
                      >
                        {row.finding_code}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-900">{row.category}</td>
                    <td className="py-3.5 px-4 text-gray-600">{row.location}</td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={row.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(row.finding_date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/findings/${row.id}`)}
                          className="p-1.5 text-gray-500 hover:text-[#600505] hover:bg-red-50 rounded-md transition-colors"
                          title="Lihat Detail Temuan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setStatusModalItem(row);
                            setNewStatus(row.status);
                            setStatusNotes('');
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Ubah Status Cepat"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3.5 bg-gray-50/40 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Menampilkan {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchFindings(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="p-1 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchFindings(p)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  pagination.page === p
                    ? 'bg-[#600505] text-white font-bold'
                    : 'border border-gray-200 hover:bg-gray-100 text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => fetchFindings(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Status Change Modal */}
      <Modal
        isOpen={!!statusModalItem}
        onClose={() => setStatusModalItem(null)}
        title={`Ubah Status: ${statusModalItem?.finding_code}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Status Baru</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#600505] focus:outline-hidden"
            >
              <option value="Open">Open (Belum ditindaklanjuti)</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Perlu Perbaikan">Perlu Perbaikan</option>
              <option value="Close">Close (Selesai & Terverifikasi)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Catatan Perubahan (Opsional)</label>
            <textarea
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Contoh: Telah diperiksa fisik di lapangan..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#600505] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setStatusModalItem(null)}
              className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUpdatingStatus}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#600505] hover:bg-[#730606] rounded-lg"
            >
              {isUpdatingStatus ? 'Menyimpan...' : 'Simpan Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
