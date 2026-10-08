import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  X, 
  Check, 
  ArrowLeft, 
  FileText, 
  Image as ImageIcon, 
  Calendar, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export function CreateFindingPage({ navigate }) {
  const { user } = useAuth();
  const { addToast } = useNotification();

  // Form Fields
  const [category, setCategory] = useState('Sarana & Prasarana');
  const [location, setLocation] = useState('LAB. E');
  const [priority, setPriority] = useState('Tinggi');
  const [findingDate, setFindingDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
  });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [picId, setPicId] = useState('');
  const [targetDate, setTargetDate] = useState('2026-07-31');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Open');

  // File Uploads
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [picsList, setPicsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function loadPics() {
      try {
        const res = await api.get('/users/pics');
        if (res.success && res.data.length > 0) {
          setPicsList(res.data);
          setPicId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadPics();
  }, []);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        addToast(`File ${file.name} melebihi batas 5 MB.`, 'error');
        continue;
      }

      try {
        setIsUploading(true);
        const res = await api.uploadFile(file);
        if (res.success) {
          setUploadedFiles(prev => [
            ...prev,
            {
              name: res.data.fileName,
              url: res.data.fileUrl,
              type: res.data.fileType,
              size: res.data.fileSize,
              preview: URL.createObjectURL(file)
            }
          ]);
          addToast(`File ${file.name} berhasil diunggah`, 'success');
        }
      } catch (err) {
        addToast(err.message || `Gagal mengunggah ${file.name}`, 'error');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeFile = (idx) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast('Judul temuan wajib diisi', 'warning');
      return;
    }
    if (!description.trim()) {
      addToast('Deskripsi temuan wajib diisi', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title,
        description,
        category,
        location,
        priority,
        finding_date: findingDate.replace('T', ' ') + ':00',
        pic_id: picId ? parseInt(picId, 10) : null,
        target_date: targetDate,
        notes,
        status: 'Open',
        attachments: uploadedFiles.map(f => ({
          name: f.name,
          url: f.url,
          type: f.type,
          size: f.size
        }))
      };

      const res = await api.post('/findings', payload);
      if (res.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        addToast(`Temuan ${res.data.finding_code} berhasil dibuat!`, 'success');
        navigate(`/findings/${res.data.id}`);
      }
    } catch (err) {
      addToast(err.message || 'Gagal menyimpan temuan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sample quick fill template buttons for realistic demonstration
  const handleQuickTemplate = (templateType) => {
    if (templateType === 'ac') {
      setTitle('AC yang rusak di dalam LAB. E');
      setCategory('Sarana & Prasarana');
      setLocation('LAB. E');
      setPriority('Tinggi');
      setDescription('Ditemukan 2 unit pendingin ruangan (AC) di LAB. E tidak berfungsi dengan baik dan mengeluarkan suara bising saat praktikum berlangsung.');
      setNotes('Perlu penggantian filter atau kompresor pendingin ruangan segera sebelum pekan ujian.');
    } else if (templateType === 'pembelajaran') {
      setTitle('Kesesuaian metode pembelajaran interaktif di Ruang Kelas 403');
      setCategory('Pembelajaran');
      setLocation('Ruang Kelas 403');
      setPriority('Sedang');
      setDescription('Ditemukan bahwa dalam proses pembelajaran di Ruang Kelas 403, metode penyampaian materi belum menggunakan media interaktif sehingga partisipasi mahasiswa relatif rendah.');
      setNotes('Perlu dilakukan evaluasi metode pembelajaran dan pemanfaatan teknologi pendukung LMS Canvas.');
    }
    addToast('Template contoh asesmen diterapkan!', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/findings')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Temuan</span>
        </button>

        {/* Quick Fill Templates */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Contoh Cepat:</span>
          <button
            type="button"
            onClick={() => handleQuickTemplate('ac')}
            className="text-xs px-2.5 py-1 bg-red-50 text-[#600505] rounded-md font-medium border border-red-100 hover:bg-red-100"
          >
            AC Rusak LAB. E
          </button>
          <button
            type="button"
            onClick={() => handleQuickTemplate('pembelajaran')}
            className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-medium border border-blue-100 hover:bg-blue-100"
          >
            Ruang Kelas 403
          </button>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-lg font-bold text-gray-900">Form Tambah Temuan Asesmen Lapangan</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Lengkapi data hasil temuan asesmen lapangan beserta bukti lampiran pendukung.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul Temuan */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Judul Temuan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: AC yang rusak di dalam LAB. E"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#600505] focus:outline-hidden"
            />
          </div>

          {/* Row 1: 4 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kategori Temuan <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
              >
                <option value="Sarana & Prasarana">Sarana & Prasarana</option>
                <option value="Pembelajaran">Pembelajaran</option>
                <option value="Dokumen">Dokumen</option>
                <option value="Penelitian">Penelitian</option>
                <option value="Pengabdian">Pengabdian</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: LAB. E / GKB III"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Tingkat Prioritas <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
              >
                <option value="Tinggi">Tinggi (Merah)</option>
                <option value="Sedang">Sedang (Oranye)</option>
                <option value="Rendah">Rendah (Hijau)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Tanggal Temuan <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={findingDate}
                onChange={(e) => setFindingDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Row 2: PIC Assignment & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                PIC Penanggung Jawab
              </label>
              <select
                value={picId}
                onChange={(e) => setPicId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
              >
                {picsList.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.department || 'PIC'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Target Penyelesaian
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Deskripsi Temuan with Character Counter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Deskripsi Temuan <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400">
                {description.length} / 1000 karakter
              </span>
            </div>
            <textarea
              rows={4}
              required
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan secara rinci kondisi atau temuan di lapangan..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#600505] focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Upload Bukti/Lampiran Area */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Upload Bukti / Lampiran (Foto / PDF)
            </label>
            <div className="border-2 border-dashed border-gray-300 hover:border-[#600505] rounded-xl p-6 text-center transition-colors bg-gray-50/50">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 text-[#600505] flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#600505] hover:underline">
                    Klik untuk upload
                  </span>
                  <span className="text-xs text-gray-500"> atau drag & drop file ke sini</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Format didukung: JPG, PNG, PDF (Maksimal 5 MB per file)
                </p>
              </label>
            </div>

            {/* Uploaded Files Preview List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg border border-gray-200 overflow-hidden bg-white p-2 flex flex-col items-center text-center shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {file.type.startsWith('image/') ? (
                      <img
                        src={file.preview || file.url}
                        alt={file.name}
                        className="w-full h-20 object-cover rounded-md mb-1"
                      />
                    ) : (
                      <div className="w-full h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 mb-1">
                        <FileText className="w-8 h-8" />
                      </div>
                    )}
                    <span className="text-[10px] font-medium text-gray-700 truncate w-full">
                      {file.name}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Awal Temuan */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-700">Status Awal Temuan</div>
              <div className="text-[11px] text-gray-500">Temuan baru akan otomatis berstatus Open</div>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
              ● Open
            </span>
          </div>

          {/* Catatan Tambahan with Character Counter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Catatan Tambahan (Opsional)
              </label>
              <span className="text-[11px] text-gray-400">
                {notes.length} / 500 karakter
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan rekomendasi awal atau informasi tindak lanjut..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#600505] focus:outline-hidden"
            />
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/findings')}
              className="px-5 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#600505] hover:bg-[#730606] active:bg-[#800808] rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Temuan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
