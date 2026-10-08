import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Save, 
  History
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ActivityBadge } from '../components/common/Badge';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { addToast } = useNotification();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '081398765432');
  const [department, setDepartment] = useState(user?.department || 'Badan Penjaminan Mutu Internal (BPMI)');
  const [address, setAddress] = useState(user?.address || 'Gedung Kuliah Bersama I Lantai 2, Kampus III UMM');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Activity Logs State
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '081398765432');
      setDepartment(user.department || 'Badan Penjaminan Mutu Internal (BPMI)');
      setAddress(user.address || 'Gedung Kuliah Bersama I Lantai 2, Kampus III UMM');
    }
  }, [user]);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await api.get('/auth/activity-logs');
        if (res.success) {
          setActivityLogs(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchLogs();
  }, []);

  // Password Validation Criteria checks
  const criteria = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };
  const isPasswordValid = Object.values(criteria).every(Boolean);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const res = await api.put('/auth/profile', {
        name,
        email,
        phone,
        department,
        address
      });
      if (res.success) {
        updateUser(res.user);
        addToast('Profil berhasil diperbarui!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Gagal memperbarui profil', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('Konfirmasi password tidak cocok', 'warning');
      return;
    }
    if (!isPasswordValid) {
      addToast('Password belum memenuhi seluruh kriteria keamanan', 'warning');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const res = await api.put('/auth/password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      if (res.success) {
        addToast('Password berhasil diubah!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      addToast(err.message || 'Gagal mengubah password', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Informasi Profil Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#600505] text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">{user?.name || 'Asesor UMM'}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-[#600505] border border-red-200">
                  {user?.role === 'Verifikator' ? 'Asesor UMM' : (user?.role || 'Pengguna')}
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span>{user?.department || 'Badan Penjaminan Mutu Internal UMM'}</span>
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>{user?.email || 'asesor@umm.ac.id'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Bergabung sejak: <b>Januari 2026</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Form Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Data Akun Form */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <User className="w-4 h-4 text-[#600505]" />
            <span>Data Akun</span>
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">No. Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Peran / Hak Akses</label>
              <input
                type="text"
                disabled
                value={user?.role === 'Verifikator' ? 'Asesor UMM' : (user?.role || 'Pengguna')}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Unit Kerja / Fakultas</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Alamat Kantor</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-5 py-2 bg-[#600505] hover:bg-[#730606] text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isUpdatingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Ubah Password Form */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#600505]" />
            <span>Ubah Password</span>
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Password Saat Ini</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full pr-10 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Password Baru</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full pr-10 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Konfirmasi Password Baru</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full pr-10 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#600505] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Criteria Checklist (matching PRD 7.9) */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] space-y-1.5">
              <span className="font-semibold text-gray-700 block mb-1">Kriteria Keamanan Password:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-gray-600">
                <div className={`flex items-center gap-1.5 ${criteria.length ? 'text-emerald-700 font-medium' : ''}`}>
                  {criteria.length ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
                  <span>Minimal 8 karakter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.upper ? 'text-emerald-700 font-medium' : ''}`}>
                  {criteria.upper ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
                  <span>Huruf besar (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.lower ? 'text-emerald-700 font-medium' : ''}`}>
                  {criteria.lower ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
                  <span>Huruf kecil (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.number ? 'text-emerald-700 font-medium' : ''}`}>
                  {criteria.number ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
                  <span>Angka (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 col-span-2 ${criteria.special ? 'text-emerald-700 font-medium' : ''}`}>
                  {criteria.special ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-gray-400" />}
                  <span>Karakter khusus (@#$%^&*)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingPassword || !isPasswordValid}
                className="px-5 py-2 bg-[#600505] hover:bg-[#730606] text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isUpdatingPassword ? 'Mengubah...' : 'Ubah Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. Aktivitas Terakhir Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#600505]" />
            <h3 className="text-sm font-bold text-gray-900">Aktivitas Terakhir Akun</h3>
          </div>
          <span className="text-xs text-gray-400">Log audit sesi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-6">Aktivitas</th>
                <th className="py-3 px-6">Deskripsi</th>
                <th className="py-3 px-6">Waktu</th>
                <th className="py-3 px-6">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {activityLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-400">
                    Belum ada catatan aktivitas khusus.
                  </td>
                </tr>
              ) : (
                activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-6">
                      <ActivityBadge type={log.activity} />
                    </td>
                    <td className="py-3 px-6 font-medium text-gray-800">{log.description}</td>
                    <td className="py-3 px-6 text-gray-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-6 text-gray-400">{log.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
