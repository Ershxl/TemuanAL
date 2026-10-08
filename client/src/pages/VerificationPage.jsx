import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  Send,
  Calendar,
  User,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { PriorityBadge, StatusBadge, DecisionBadge } from '../components/common/Badge';
import { ImageZoomModal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export function VerificationPage({ navigate }) {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [pendingList, setPendingList] = useState([]);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [decision, setDecision] = useState('Valid');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/verifications/pending');
      if (res.success) {
        setPendingList(res.data);
        if (res.data.length > 0 && !selectedFinding) {
          // Auto select first item
          loadFindingDetails(res.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Gagal memuat temuan menunggu verifikasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadFindingDetails = async (id) => {
    try {
      const res = await api.get(`/findings/${id}`);
      if (res.success) {
        setSelectedFinding(res.data);
        setNotes('');
        setDecision('Valid');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const handleSaveVerification = async (e) => {
    e.preventDefault();
    if (!selectedFinding) return;

    try {
      setIsSubmitting(true);
      const res = await api.post(`/verifications/${selectedFinding.id}`, {
        decision,
        notes
      });
      if (res.success) {
        if (decision === 'Valid' || decision === 'Valid dengan Catatan') {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
        addToast(res.message || 'Verifikasi berhasil disimpan', 'success');
        setSelectedFinding(null);
        fetchPendingVerifications();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menyimpan verifikasi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#600505]" />
            <h2 className="text-lg font-bold text-gray-900">Verifikasi Temuan Asesmen Lapangan</h2>
          </div>
          <p className="text-xs text-gray-500">
            Periksa hasil tindak lanjut perbaikan dari PIC dan berikan keputusan verifikasi resmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingList.length} Temuan Menunggu</span>
          </span>
        </div>
      </div>

      {/* Main Layout: List on Left (if multiple) / Verification Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Pending List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider px-1">
            Daftar Antrean Verifikasi:
          </h3>

          {loading ? (
            <div className="py-10 text-center bg-white rounded-xl border border-gray-100 p-4">
              <div className="w-6 h-6 border-2 border-[#600505] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span className="text-xs text-gray-400">Memuat antrean...</span>
            </div>
          ) : pendingList.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-gray-800">Semua Temuan Telah Diverifikasi!</h4>
              <p className="text-xs text-gray-500 mt-1">Tidak ada temuan yang sedang menunggu verifikasi asesor.</p>
              <button
                onClick={() => navigate('/findings')}
                className="mt-3 text-xs text-[#600505] hover:underline font-semibold"
              >
                Lihat Semua Temuan →
              </button>
            </div>
          ) : (
            pendingList.map((item) => (
              <div
                key={item.id}
                onClick={() => loadFindingDetails(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                  selectedFinding?.id === item.id
                    ? 'border-[#600505] ring-2 ring-[#600505]/15 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-bold text-xs text-[#600505]">{item.finding_code}</span>
                  <PriorityBadge priority={item.priority} />
                </div>
                <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.title || item.category}</h4>
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                  <span>PIC: {item.pic_name || 'Budi Santoso'}</span>
                  <span>{new Date(item.finding_date).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Verification Workstation (8 Cols) */}
        <div className="lg:col-span-8">
          {selectedFinding ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Menunggu Verifikasi
                    </span>
                    <span className="font-bold text-sm text-[#600505]">{selectedFinding.finding_code}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{selectedFinding.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selectedFinding.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedFinding.finding_date).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/findings/${selectedFinding.id}`)}
                  className="text-xs text-[#600505] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Buka Halaman Detail Penuh</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Before vs After Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Before: Temuan Awal */}
                <div className="p-4 rounded-xl bg-red-50/40 border border-red-100 space-y-2">
                  <div className="font-bold text-red-900 flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    1. Kondisi Temuan Awal
                  </div>
                  <p className="text-gray-700 leading-relaxed text-[11px] min-h-[48px]">
                    {selectedFinding.description}
                  </p>
                  <div className="pt-2">
                    <img
                      src="/images/ac_rusak.jpg"
                      alt="Kondisi Awal"
                      onClick={() => setZoomImage('/images/ac_rusak.jpg')}
                      className="w-full h-32 object-cover rounded-lg border border-red-200 cursor-pointer hover:opacity-90 shadow-xs"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block text-center">Foto Bukti Awal</span>
                  </div>
                </div>

                {/* After: Tindak Lanjut PIC */}
                <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-2">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    2. Hasil Tindak Lanjut PIC ({selectedFinding.pic_name || 'Budi Santoso'})
                  </div>
                  <p className="text-gray-700 leading-relaxed text-[11px] min-h-[48px]">
                    {selectedFinding.follow_ups?.[0]?.description ||
                      'Telah dilakukan perbaikan dan penggantian suku cadang serta pengecekan fungsi sesuai standar operasional.'}
                  </p>
                  <div className="pt-2">
                    <img
                      src="/images/ac_repaired.jpg"
                      alt="Hasil Tindak Lanjut"
                      onClick={() => setZoomImage('/images/ac_repaired.jpg')}
                      className="w-full h-32 object-cover rounded-lg border border-emerald-200 cursor-pointer hover:opacity-90 shadow-xs"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block text-center">Foto Bukti Selesai</span>
                  </div>
                </div>
              </div>

              {/* Blue Petunjuk Verifikasi Box (matching PRD & Design) */}
              <div className="p-4 rounded-xl bg-blue-50 border-l-4 border-blue-600 text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Petunjuk Verifikasi</span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-800">
                  Periksa kesesuaian tindakan perbaikan PIC dengan akar masalah temuan awal. Pastikan bukti fisik telah berfungsi normal. Pilih <b>Valid</b> untuk menutup temuan (Status Close), atau <b>Tidak Valid</b> untuk meminta perbaikan ulang oleh PIC.
                </p>
              </div>

              {/* Form Verifikasi Decision */}
              <form onSubmit={handleSaveVerification} className="space-y-4 text-xs pt-2">
                <div>
                  <label className="block font-bold text-gray-900 mb-2">
                    Keputusan Asesor <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label
                      className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        decision === 'Valid'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold ring-2 ring-emerald-600/30'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="verif_decision"
                        value="Valid"
                        checked={decision === 'Valid'}
                        onChange={(e) => setDecision(e.target.value)}
                        className="hidden"
                      />
                      <span className="text-base font-bold text-emerald-600">✓</span>
                      <span>Valid (Status Close)</span>
                    </label>

                    <label
                      className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        decision === 'Valid dengan Catatan'
                          ? 'bg-amber-50 border-amber-600 text-amber-900 font-bold ring-2 ring-amber-600/30'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="verif_decision"
                        value="Valid dengan Catatan"
                        checked={decision === 'Valid dengan Catatan'}
                        onChange={(e) => setDecision(e.target.value)}
                        className="hidden"
                      />
                      <span className="text-base font-bold text-amber-600">⚠</span>
                      <span>Valid dgn Catatan</span>
                    </label>

                    <label
                      className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        decision === 'Tidak Valid'
                          ? 'bg-rose-50 border-rose-600 text-rose-900 font-bold ring-2 ring-rose-600/30'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="verif_decision"
                        value="Tidak Valid"
                        checked={decision === 'Tidak Valid'}
                        onChange={(e) => setDecision(e.target.value)}
                        className="hidden"
                      />
                      <span className="text-base font-bold text-rose-600">✕</span>
                      <span>Tidak Valid (Perlu Perbaikan)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-gray-700">
                      Catatan Verifikasi Asesor (Opsional)
                    </label>
                    <span className="text-[10px] text-gray-400">{notes.length} / 1000 karakter</span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tuliskan alasan keputusan atau instruksi perbaikan lanjutan..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#600505] focus:outline-hidden"
                  />
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-gray-600">
                  <span>Diverifikasi Oleh: <b>{user?.name || 'Asesor UMM'}</b> (Akun Terkunci)</span>
                  <span>Tanggal Verifikasi: <b>{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</b></span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedFinding(null)}
                    className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 text-xs font-semibold text-white bg-[#600505] hover:bg-[#730606] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Verifikasi'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs">
              <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-700">Pilih Temuan dari Daftar</h3>
              <p className="text-xs text-gray-400 mt-1">
                Pilih salah satu temuan di sebelah kiri untuk meninjau bukti dan memutuskan hasil verifikasi.
              </p>
            </div>
          )}
        </div>
      </div>

      <ImageZoomModal
        isOpen={!!zoomImage}
        imageUrl={zoomImage}
        onClose={() => setZoomImage(null)}
        title="Bukti Verifikasi Temuan"
      />
    </div>
  );
}
