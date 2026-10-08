import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  MessageSquareQuote, 
  Plus, 
  Eye, 
  ArrowRight,
  ChevronLeft,
  ChevronRight
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
import { api } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export function DashboardPage({ navigate }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const isPIC = user?.role === 'PIC';

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/stats', { year: selectedYear });
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [selectedYear]);

  // Handle click on summary card "Lihat detail ->"
  const handleCardClick = (statusFilter) => {
    if (statusFilter) {
      navigate(`/findings?status=${encodeURIComponent(statusFilter)}`);
    } else {
      navigate('/findings');
    }
  };

  const cards = stats?.cards || {
    total: 25,
    open: 10,
    close: 12,
    waiting: 3,
  };

  const monthlyData = stats?.monthlyData || [
    { name: 'Jan', jumlah: 4 },
    { name: 'Feb', jumlah: 6 },
    { name: 'Mar', jumlah: 8 },
    { name: 'Apr', jumlah: 5 },
    { name: 'Mei', jumlah: 12 },
    { name: 'Jun', jumlah: 15 },
    { name: 'Jul', jumlah: 7 },
  ];

  const statusPieData = stats?.statusData || [
    { name: 'Open', value: 10, color: '#2563eb' },
    { name: 'Menunggu Verifikasi', value: 3, color: '#f59e0b' },
    { name: 'Close', value: 12, color: '#16a34a' }
  ];

  const recentFindings = stats?.recentFindings || [];

  const formattedDate = currentDateTime.toLocaleDateString('id-ID', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });
  const formattedTime = currentDateTime.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return (
    <div className="space-y-6">
      {/* Real-time date/time banner */}
      <div className="bg-gradient-to-r from-[#600505] to-[#8B0A0A] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <p className="text-red-200 text-xs font-semibold uppercase tracking-widest mb-0.5">Selamat Datang, {user?.name || 'Pengguna'}</p>
          <h2 className="text-white text-base sm:text-lg font-bold leading-tight">Dashboard SIMATAP UMM – TemuanAL</h2>
          <p className="text-red-200/80 text-xs mt-0.5">Sistem Manajemen Asesmen Internal Perguruan Tinggi</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-0.5 flex-shrink-0 bg-white/10 rounded-xl px-4 py-3">
          <span className="text-white text-xl font-black tabular-nums tracking-tight">{formattedTime}</span>
          <span className="text-red-200 text-xs font-medium">{formattedDate}</span>
        </div>
      </div>

      {/* 1. Four Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Temuan */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-gray-500">Total Temuan</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{cards.total}</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">Semua temuan</span>
            <button
              onClick={() => handleCardClick('')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
            >
              <span>Lihat detail</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Temuan Open */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-gray-500">Temuan Open</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{cards.open}</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">Belum ditindaklanjuti</span>
            <button
              onClick={() => handleCardClick('Open')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1 group"
            >
              <span>Lihat detail</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Temuan Close */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-gray-500">Temuan Close</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{cards.close}</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">Sudah ditindaklanjuti</span>
            <button
              onClick={() => handleCardClick('Close')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 group"
            >
              <span>Lihat detail</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Menunggu Verifikasi */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <MessageSquareQuote className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-gray-500">Menunggu Verifikasi</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{cards.waiting}</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">Perlu verifikasi asesor</span>
            <button
              onClick={() => handleCardClick('Menunggu Verifikasi')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 group"
            >
              <span>Lihat detail</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Charts Row: Bar Chart and Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Grafik Temuan per Bulan</h3>
              <p className="text-xs text-gray-400 mt-0.5">Jumlah temuan asesmen lapangan</p>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs font-medium bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-[#600505]"
            >
              <option value="2026">Tahun 2026</option>
              <option value="2025">Tahun 2025</option>
            </select>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="jumlah" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={28} label={{ position: 'top', fill: '#64748b', fontSize: 10 }} />
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
            <p className="text-xs text-gray-400 mt-0.5">Persentase status asesmen terkini</p>
          </div>

          <div className="h-48 w-full relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend matching Prototype */}
          <div className="space-y-2 border-t border-gray-50 pt-3">
            {statusPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-700 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">
                  {item.value} ({cards.total > 0 ? Math.round((item.value / cards.total) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Temuan Terbaru Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Temuan Terbaru</h3>
            <p className="text-xs text-gray-500">Daftar temuan asesmen lapangan yang baru tercatat</p>
          </div>

          {!isPIC && (
            <button
              onClick={() => navigate('/findings/create')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#600505] hover:bg-[#730606] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Temuan</span>
            </button>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">ID Temuan</th>
                <th className="py-3.5 px-4 font-semibold">Kategori</th>
                <th className="py-3.5 px-4 font-semibold">Lokasi</th>
                <th className="py-3.5 px-4 font-semibold">Prioritas</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Tanggal Temuan</th>
                <th className="py-3.5 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {recentFindings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400">
                    Belum ada data temuan terbaru.
                  </td>
                </tr>
              ) : (
                recentFindings.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#600505]">
                      <button
                        onClick={() => navigate(`/findings/${row.id}`)}
                        className="hover:underline font-bold"
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
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => navigate(`/findings/${row.id}`)}
                        className="p-1.5 text-gray-500 hover:text-[#600505] hover:bg-red-50 rounded-md transition-colors"
                        title="Lihat Detail Temuan"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination matching Screenshot */}
        <div className="px-6 py-3.5 bg-gray-50/40 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <div>Menampilkan 1 - 5 dari {cards.total} data</div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/findings')}
              className="p-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-2.5 py-1 rounded bg-[#600505] text-white font-semibold">1</button>
            <button onClick={() => navigate('/findings?page=2')} className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-700">2</button>
            <button onClick={() => navigate('/findings?page=3')} className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-700">3</button>
            <span className="px-1 text-gray-400">...</span>
            <button onClick={() => navigate('/findings?page=5')} className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-700">5</button>
            <button
              onClick={() => navigate('/findings')}
              className="p-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
