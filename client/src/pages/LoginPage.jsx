import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Modal } from '../components/common/Modal';

export function LoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const { addToast } = useNotification();

  const [username, setUsername] = useState('asesor');
  const [password, setPassword] = useState('asesor123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await login(username, password);
      addToast('Selamat datang di SIMATAP UMM!', 'success');
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setErrorMessage(err.message || 'Login gagal. Periksa username dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Account Select
  const selectDemoUser = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (userType === 'asesor') {
      setUsername('asesor');
      setPassword('asesor123');
    } else if (userType === 'pic') {
      setUsername('pic_sarpras');
      setPassword('pic123');
    }
    setErrorMessage('');
  };

  const handleGoogleLogin = () => {
    setUsername('asesor');
    setPassword('asesor123');
    addToast('Simulasi Login Google Berhasil: Masuk sebagai Asesor UMM (asesor@umm.ac.id)', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Column: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 xl:p-20">
        <div className="max-w-md w-full mx-auto my-auto py-8">
          {/* UMM Branding Logo */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md border border-gray-200">
              <img src="/images/umm_logo.png" alt="Logo UMM" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-3xl font-black tracking-tight text-[#600505]">
                UMM
              </div>
              <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                Universitas Muhammadiyah Malang
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Selamat Datang di SIMATAP UMM
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Sistem Manajemen Asesmen Internal Perguruan Tinggi
            </p>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username atau email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#600505] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#600505] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center text-xs text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#600505] focus:ring-[#600505] border-gray-300 mr-2"
                />
                Ingat saya
              </label>
              <button
                type="button"
                onClick={() => { setShowForgotModal(true); setForgotSubmitted(false); }}
                className="text-xs font-medium text-[#600505] hover:underline"
              >
                Lupa password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-[#600505] hover:bg-[#730606] active:bg-[#800808] text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Masuk</span>
              )}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-500">
                <span className="bg-white px-3">atau masuk dengan</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Login dengan Google</span>
            </button>
          </form>

          {/* Quick Demo Role Selector Pills */}
          <div className="mt-8 pt-5 border-t border-gray-100">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">
              Pilih Akun Demo Pengujian:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => selectDemoUser('admin')}
                className={`py-2 px-2 text-xs rounded-lg border text-center transition-all ${
                  username === 'admin'
                    ? 'bg-[#600505] text-white border-[#600505] font-semibold'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => selectDemoUser('asesor')}
                className={`py-2 px-2 text-xs rounded-lg border text-center transition-all ${
                  username === 'asesor'
                    ? 'bg-[#600505] text-white border-[#600505] font-semibold'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Asesor
              </button>
              <button
                type="button"
                onClick={() => selectDemoUser('pic')}
                className={`py-2 px-2 text-xs rounded-lg border text-center transition-all ${
                  username === 'pic_sarpras'
                    ? 'bg-[#600505] text-white border-[#600505] font-semibold'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                PIC Sarpras
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400 mt-6">
          &copy; 2026 SIMATAP UMM. All rights reserved.
        </div>
      </div>

      {/* Right Column: UMM GKB I Photo with Maroon tint overlay */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-[#600505]">
        <img
          src="/images/umm_gkb.jpg"
          alt="Gedung Kuliah Bersama UMM"
          className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-85 scale-105"
        />
        {/* Red gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#400202]/90 via-[#600505]/70 to-[#600505]/40" />

        {/* Floating Glassmorphism Badge */}
        <div className="absolute top-10 right-10 max-w-sm p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold">SIMATAP UMM</h4>
              <p className="text-xs text-red-100 mt-0.5 leading-relaxed">
                Sistem terintegrasi untuk pengelolaan asesmen internal yang efektif dan efisien.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="text-xs uppercase tracking-widest text-red-200 font-bold mb-1">
            Modul Temuan AL
          </div>
          <h3 className="text-2xl font-bold leading-tight">
            Penjaminan Mutu Berkelanjutan Universitas Muhammadiyah Malang
          </h3>
          <p className="text-sm text-red-100/90 mt-2 max-w-md">
            Mewujudkan tata kelola perguruan tinggi unggul melalui pemantauan dan tindak lanjut asesmen lapangan yang transparan.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Pemulihan Kata Sandi"
        maxWidth="max-w-md"
      >
        {forgotSubmitted ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-gray-900">Instruksi Terkirim!</h4>
            <p className="text-xs text-gray-600">
              Tautan reset kata sandi telah dikirimkan ke <b>{forgotEmail}</b>. Silakan periksa kotak masuk atau spam email Anda.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="mt-4 px-4 py-2 bg-[#600505] text-white text-xs font-semibold rounded-lg"
            >
              Tutup
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setForgotSubmitted(true);
            }}
            className="space-y-4"
          >
            <p className="text-xs text-gray-600">
              Masukkan alamat email terdaftar Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="nama@umm.ac.id"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#600505] focus:outline-hidden"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#600505] rounded-lg hover:bg-[#730606]"
              >
                Kirim Tautan Reset
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
