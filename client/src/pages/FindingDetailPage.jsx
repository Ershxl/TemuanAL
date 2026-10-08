import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Edit3, 
  MapPin, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  UploadCloud, 
  Image as ImageIcon, 
  CheckSquare, 
  AlertTriangle,
  Plus,
  Send,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge, PriorityBadge, ActivityBadge, DecisionBadge } from '../components/common/Badge';
import { Modal, ImageZoomModal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export function FindingDetailPage({ findingId, navigate }) {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [finding, setFinding] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'deskripsi' | 'tindak_lanjut' | 'riwayat'
  const [loading, setLoading] = useState(true);

  // Modals
  const [zoomImage, setZoomImage] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  // PIC Follow-up Form state
  const [fuDescription, setFuDescription] = useState('');
  const [fuActionDate, setFuActionDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [fuNotes, setFuNotes] = useState('');
  const [fuProofUrl, setFuProofUrl] = useState('/images/ac_repaired.jpg');
  const [isSubmittingFu, setIsSubmittingFu] = useState(false);

  // Verifikator Decision Modal from detail
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyDecision, setVerifyDecision] = useState('Valid');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);

  const fetchFindingDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/findings/${findingId}`);
      if (res.success) {
        setFinding(res.data);
        setNewStatus(res.data.status);
      }
    } catch (err) {
      console.error(err);
      addToast('Gagal memuat detail temuan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (findingId) {
      fetchFindingDetail();
    }
  }, [findingId]);

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/findings/${finding.id}/status`, {
        status: newStatus,
        notes: statusNotes
      });
      addToast(`Status berhasil diubah menjadi ${newStatus}`, 'success');
      setShowStatusModal(false);
      fetchFindingDetail();
    } catch (err) {
      addToast(err.message || 'Gagal mengubah status', 'error');
    }
  };

  const handleSubmitFollowUp = async (e) => {
    e.preventDefault();
    if (!fuDescription.trim()) {
      addToast('Deskripsi tindakan wajib diisi', 'warning');
      return;
    }

    try {
      setIsSubmittingFu(true);
      const res = await api.post(`/follow-ups/${finding.id}`, {
        description: fuDescription,
        action_date: fuActionDate,
        notes: fuNotes,
        proof_url: fuProofUrl
      });
      if (res.success) {
        addToast('Tindak lanjut berhasil dikirim! Status temuan kini Menunggu Verifikasi.', 'success');
        setFuDescription('');
        setFuNotes('');
        fetchFindingDetail();
        setActiveTab('info');
      }
    } catch (err) {
      addToast(err.message || 'Gagal mengirim tindak lanjut', 'error');
    } finally {
      setIsSubmittingFu(false);
    }
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingVerify(true);
      const res = await api.post(`/verifications/${finding.id}`, {
        decision: verifyDecision,
        notes: verifyNotes
      });
      if (res.success) {
        addToast(`Hasil verifikasi disimpan! Status temuan kini ${res.data.status}.`, 'success');
        setShowVerifyModal(false);
        fetchFindingDetail();
      }
    } catch (err) {
      addToast(err.message || 'Gagal memverifikasi', 'error');
    } finally {
      setIsSubmittingVerify(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#600505] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-medium">Memuat detail temuan {findingId}...</p>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="bg-white rounded-xl p-8 text-center max-w-md mx-auto border border-gray-100 shadow-xs">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h3 className="font-bold text-gray-900 text-base">Temuan Tidak Ditemukan</h3>
        <p className="text-xs text-gray-500 mt-1">Data temuan yang Anda cari tidak tersedia atau telah dihapus.</p>
        <button
          onClick={() => navigate('/findings')}
          className="mt-4 px-4 py-2 bg-[#600505] text-white text-xs font-semibold rounded-lg"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  const isPIC = user?.role === 'PIC';
  const isVerifikatorOrAdmin = user?.role === 'Verifikator' || user?.role === 'Asesor' || user?.role === 'Admin';
  const canVerify = isVerifikatorOrAdmin && finding.status === 'Menunggu Verifikasi';

  return (
    <div className="space-y-6">
      {/* 1. Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <button
            onClick={() => navigate('/findings')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Direct Verification Button if awaiting */}
            {canVerify && (
              <button
                onClick={() => setShowVerifyModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Verifikasi Temuan Ini</span>
              </button>
            )}

            <button
              onClick={() => setShowStatusModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#600505] hover:bg-[#730606] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Ubah Status</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        {/* Main Finding Overview Banner */}
        <div className="mt-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <PriorityBadge priority={finding.priority} />
              <span className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                {finding.finding_code}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              {finding.title || finding.category}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5 font-medium">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{finding.location}</span>
            </div>
          </div>

          {/* Right Meta Info Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 text-xs">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">Tanggal Temuan</div>
                <div className="font-semibold text-gray-800">
                  {new Date(finding.finding_date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">Dibuat Oleh</div>
                <div className="font-semibold text-gray-800">{finding.creator_name || 'Asesor UMM'}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">Terakhir Diperbarui</div>
                <div className="font-semibold text-gray-800">
                  {new Date(finding.updated_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 px-3 transition-colors relative cursor-pointer ${
            activeTab === 'info'
              ? 'text-[#600505] font-bold border-b-2 border-[#600505]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Informasi Temuan
        </button>

        <button
          onClick={() => setActiveTab('deskripsi')}
          className={`pb-3 px-3 transition-colors relative cursor-pointer ${
            activeTab === 'deskripsi'
              ? 'text-[#600505] font-bold border-b-2 border-[#600505]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Deskripsi & Bukti
        </button>

        <button
          onClick={() => setActiveTab('tindak_lanjut')}
          className={`pb-3 px-3 transition-colors relative cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'tindak_lanjut'
              ? 'text-[#600505] font-bold border-b-2 border-[#600505]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Tindak Lanjut PIC</span>
          {finding.status === 'Open' && (
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('riwayat')}
          className={`pb-3 px-3 transition-colors relative cursor-pointer ${
            activeTab === 'riwayat'
              ? 'text-[#600505] font-bold border-b-2 border-[#600505]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Riwayat Perubahan
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: INFORMASI TEMUAN */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Informasi Umum Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Informasi Umum
              </h3>
              <div className="divide-y divide-gray-100 text-xs">
                <div className="py-2.5 grid grid-cols-3">
                  <span className="text-gray-500 font-medium">ID Temuan</span>
                  <span className="col-span-2 font-bold text-[#600505]">{finding.finding_code}</span>
                </div>
                <div className="py-2.5 grid grid-cols-3">
                  <span className="text-gray-500 font-medium">Kategori Temuan</span>
                  <span className="col-span-2 font-semibold text-gray-800">{finding.category}</span>
                </div>
                <div className="py-2.5 grid grid-cols-3">
                  <span className="text-gray-500 font-medium">Lokasi</span>
                  <span className="col-span-2 text-gray-800">{finding.location}</span>
                </div>
                <div className="py-2.5 grid grid-cols-3 items-center">
                  <span className="text-gray-500 font-medium">Prioritas</span>
                  <span className="col-span-2">
                    <PriorityBadge priority={finding.priority} />
                  </span>
                </div>
                <div className="py-2.5 grid grid-cols-3 items-center">
                  <span className="text-gray-500 font-medium">Status</span>
                  <span className="col-span-2">
                    <StatusBadge status={finding.status} />
                  </span>
                </div>
                <div className="py-2.5 grid grid-cols-3">
                  <span className="text-gray-500 font-medium">Tanggal Temuan</span>
                  <span className="col-span-2 text-gray-800">
                    {new Date(finding.finding_date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="py-2.5 grid grid-cols-3">
                  <span className="text-gray-500 font-medium">Dibuat Oleh</span>
                  <span className="col-span-2 text-gray-800">{finding.creator_name || 'Asesor UMM'}</span>
                </div>
                <div className="py-2.5 grid grid-cols-3">
                  <span className="text-gray-500 font-medium">Terakhir Diperbarui</span>
                  <span className="col-span-2 text-gray-800">
                    {new Date(finding.updated_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Deskripsi Singkat Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Deskripsi Singkat</h3>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/60 p-4 rounded-xl border border-gray-100">
                {finding.description}
              </p>
            </div>

            {/* Catatan Tambahan Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Catatan Tambahan</h3>
              <p className="text-xs text-gray-600 italic bg-gray-50/60 p-4 rounded-xl border border-gray-100">
                {finding.notes || 'Tidak ada catatan tambahan khusus.'}
              </p>
            </div>
          </div>

          {/* Right Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Bukti / Lampiran Gallery Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Bukti / Lampiran</h3>
                <span className="text-xs text-gray-400">
                  {finding.attachments?.length || 1} file (4.2 MB)
                </span>
              </div>

              {/* Photos Gallery Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {finding.attachments && finding.attachments.length > 0 ? (
                  finding.attachments.map((att) => (
                    <div
                      key={att.id}
                      onClick={() => setZoomImage(att.file_url)}
                      className="relative h-24 rounded-xl overflow-hidden border border-gray-200 cursor-pointer group shadow-xs hover:border-[#600505]"
                    >
                      <img
                        src={att.file_url}
                        alt={att.file_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    onClick={() => setZoomImage('/images/ac_rusak.jpg')}
                    className="relative h-24 rounded-xl overflow-hidden border border-gray-200 cursor-pointer group shadow-xs"
                  >
                    <img
                      src="/images/ac_rusak.jpg"
                      alt="Bukti Temuan"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}

                {/* Upload placeholder box */}
                <div
                  onClick={() => setActiveTab('tindak_lanjut')}
                  className="h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#600505] flex flex-col items-center justify-center text-gray-400 hover:text-[#600505] cursor-pointer transition-colors bg-gray-50/50"
                >
                  <UploadCloud className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-semibold">+ Bukti</span>
                </div>
              </div>
            </div>

            {/* Status & Tindak Lanjut Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                Status & Tindak Lanjut
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status Awal</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                    Open
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status Saat Ini</span>
                  <StatusBadge status={finding.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Penanggung Jawab</span>
                  <span className="font-semibold text-gray-800">
                    {finding.pic_name || 'Budi Santoso (Sarpras)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Unit PIC</span>
                  <span className="text-gray-600 text-right">
                    {finding.pic_department || 'Biro Umum & Sarpras'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Target Penyelesaian</span>
                  <span className="font-medium text-gray-700">
                    {finding.target_date || '31 Jul 2026'}
                  </span>
                </div>
              </div>
            </div>

            {/* Riwayat Perubahan Terbaru Mini Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                Riwayat Perubahan Terbaru
              </h3>
              <div className="space-y-3">
                {finding.activity_logs && finding.activity_logs.length > 0 ? (
                  finding.activity_logs.slice(0, 3).map((log) => (
                    <div key={log.id} className="flex items-start gap-2.5 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#600505] mt-1.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-[10px]">
                            {new Date(log.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <ActivityBadge type={log.activity} />
                        </div>
                        <p className="text-gray-700 mt-0.5 text-[11px] leading-snug">
                          {log.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400">Belum ada riwayat aktivitas.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DESKRIPSI & BUKTI */}
      {activeTab === 'deskripsi' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Deskripsi Rinci Asesmen</h3>
            <p className="text-sm text-gray-700 leading-relaxed p-4 bg-gray-50 rounded-xl border border-gray-200">
              {finding.description}
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">Galeri Foto & Dokumen Pendukung</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {finding.attachments && finding.attachments.length > 0 ? (
                finding.attachments.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => setZoomImage(att.file_url)}
                    className="group border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all bg-gray-50"
                  >
                    <div className="h-44 w-full bg-gray-900 overflow-hidden flex items-center justify-center">
                      <img
                        src={att.file_url}
                        alt={att.file_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3 bg-white flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-800 truncate">{att.file_name}</span>
                      <span className="text-gray-400 text-[10px]">{(att.file_size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  onClick={() => setZoomImage('/images/ac_rusak.jpg')}
                  className="border border-gray-200 rounded-xl overflow-hidden cursor-pointer bg-gray-50"
                >
                  <img src="/images/ac_rusak.jpg" alt="Bukti" className="w-full h-44 object-cover" />
                  <div className="p-3 text-xs font-semibold text-gray-700">bukti_temuan_asesmen.jpg</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TINDAK LANJUT PIC */}
      {activeTab === 'tindak_lanjut' && (
        <div className="space-y-6">
          {/* Follow-up Submissions History */}
          {finding.follow_ups && finding.follow_ups.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-900">Riwayat Tindak Lanjut PIC</h3>
              <div className="space-y-4">
                {finding.follow_ups.map((fu) => (
                  <div key={fu.id} className="p-5 rounded-xl border border-emerald-100 bg-emerald-50/20 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{fu.pic_name}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                          Tindak Lanjut Dikirim
                        </span>
                      </div>
                      <span className="text-gray-500">
                        Tanggal: {new Date(fu.action_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-xs text-gray-800 leading-relaxed bg-white p-3.5 rounded-lg border border-gray-200">
                      {fu.description}
                    </p>

                    {fu.notes && (
                      <p className="text-xs text-gray-600 italic">
                        Catatan: {fu.notes}
                      </p>
                    )}

                    <div className="pt-2 flex items-center gap-3">
                      <img
                        src="/images/ac_repaired.jpg"
                        alt="Bukti Perbaikan Selesai"
                        onClick={() => setZoomImage('/images/ac_repaired.jpg')}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-300 cursor-pointer hover:border-emerald-600 transition-colors shadow-xs"
                      />
                      <span className="text-xs text-gray-500">Foto bukti tindak lanjut selesai (Klik untuk perbesar)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form to submit Follow-up (PIC or Admin) */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs">
            <div className="border-b border-gray-100 pb-3 mb-5">
              <h3 className="text-base font-bold text-gray-900">Form Tindak Lanjut Temuan</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                PIC mencatat perbaikan yang telah dilaksanakan dan mengunggah bukti penyelesaian untuk diverifikasi oleh Asesor.
              </p>
            </div>

            <form onSubmit={handleSubmitFollowUp} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Deskripsi Tindakan Perbaikan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={fuDescription}
                  onChange={(e) => setFuDescription(e.target.value)}
                  placeholder="Jelaskan tindakan nyata perbaikan yang telah diselesaikan..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#600505] focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">
                    Tanggal Tindakan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={fuActionDate}
                    onChange={(e) => setFuActionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">
                    Status Setelah Tindak Lanjut
                  </label>
                  <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Menunggu Verifikasi (Otomatis)
                  </div>
                </div>
              </div>

              {/* Upload Bukti Tindak Lanjut */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Upload Foto Bukti Perbaikan Selesai
                </label>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <img
                    src={fuProofUrl}
                    alt="Pratinjau Bukti"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-300 shadow-xs"
                  />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-800">bukti_perbaikan_selesai.jpg</div>
                    <div className="text-[11px] text-gray-500">Foto unit AC baru / perbaikan siap diverifikasi</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToast('Foto bukti tindak lanjut siap diunggah', 'info')}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100"
                  >
                    Ganti Foto
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Catatan PIC Tambahan
                </label>
                <textarea
                  rows={2}
                  value={fuNotes}
                  onChange={(e) => setFuNotes(e.target.value)}
                  placeholder="Catatan pengetesan fungsi atau hasil evaluasi..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#600505] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmittingFu}
                  className="px-6 py-2.5 bg-[#600505] hover:bg-[#730606] text-white font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 text-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingFu ? 'Mengirim...' : 'Ajukan untuk Verifikasi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: RIWAYAT PERUBAHAN */}
      {activeTab === 'riwayat' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
            Linimasa Riwayat Perubahan & Audit Trail
          </h3>

          <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
            {finding.activity_logs && finding.activity_logs.length > 0 ? (
              finding.activity_logs.map((log) => (
                <div key={log.id} className="relative group text-xs">
                  {/* Dot */}
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#600505] border-2 border-white shadow-xs" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{log.user_name}</span>
                      <ActivityBadge type={log.activity} />
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(log.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} (IP: {log.ip_address})
                    </span>
                  </div>

                  <p className="text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                    {log.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-xs">Belum ada riwayat aktivitas yang tercatat.</div>
            )}
          </div>
        </div>
      )}

      {/* Ubah Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Ubah Status Temuan"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">Pilih Status Baru</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#600505] focus:outline-hidden"
            >
              <option value="Open">Open (Belum ditindaklanjuti)</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Perlu Perbaikan">Perlu Perbaikan</option>
              <option value="Close">Close (Selesai & Diverifikasi)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">Catatan Perubahan (Opsional)</label>
            <textarea
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Berikan alasan perubahan status..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#600505] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowStatusModal(false)}
              className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#600505] hover:bg-[#730606] rounded-lg"
            >
              Simpan Status
            </button>
          </div>
        </form>
      </Modal>

      {/* Verification Decision Modal (for Asesor) */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title={`Verifikasi Hasil Tindak Lanjut: ${finding.finding_code}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitVerification} className="space-y-4 text-xs">
          {/* Decision Radios */}
          <div>
            <label className="block font-bold text-gray-900 mb-2">
              Keputusan Verifikasi <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  verifyDecision === 'Valid'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold ring-1 ring-emerald-600'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="Valid"
                  checked={verifyDecision === 'Valid'}
                  onChange={(e) => setVerifyDecision(e.target.value)}
                  className="hidden"
                />
                <span className="text-sm">✓</span>
                <span>Valid (Close)</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  verifyDecision === 'Valid dengan Catatan'
                    ? 'bg-amber-50 border-amber-600 text-amber-800 font-bold ring-1 ring-amber-600'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="Valid dengan Catatan"
                  checked={verifyDecision === 'Valid dengan Catatan'}
                  onChange={(e) => setVerifyDecision(e.target.value)}
                  className="hidden"
                />
                <span className="text-sm">⚠</span>
                <span className="text-center">Valid dgn Catatan</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                  verifyDecision === 'Tidak Valid'
                    ? 'bg-rose-50 border-rose-600 text-rose-800 font-bold ring-1 ring-rose-600'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="Tidak Valid"
                  checked={verifyDecision === 'Tidak Valid'}
                  onChange={(e) => setVerifyDecision(e.target.value)}
                  className="hidden"
                />
                <span className="text-sm">✕</span>
                <span>Tidak Valid</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">
              Catatan Verifikasi Asesor (Opsional)
            </label>
            <textarea
              rows={3}
              maxLength={1000}
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
              placeholder="Tuliskan catatan evaluasi atau instruksi tambahan jika ada..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#600505] focus:outline-hidden"
            />
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-[11px] text-gray-600">
            <span>Diverifikasi Oleh: <b>{user?.name || 'Asesor UMM'}</b></span>
            <span>Tanggal: <b>{new Date().toLocaleDateString('id-ID')}</b></span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowVerifyModal(false)}
              className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmittingVerify}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#600505] hover:bg-[#730606] rounded-lg"
            >
              {isSubmittingVerify ? 'Menyimpan...' : 'Simpan Verifikasi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={!!zoomImage}
        imageUrl={zoomImage}
        onClose={() => setZoomImage(null)}
        title={`Lampiran Temuan: ${finding.finding_code}`}
      />
    </div>
  );
}
