import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  ListOrdered, 
  PlusCircle, 
  CheckSquare, 
  FileSpreadsheet, 
  UserCircle2, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ currentPath, navigate, isOpen, onClose }) {
  const { user, logout } = useAuth();
  const [temuanExpanded, setTemuanExpanded] = useState(true);

  const role = user?.role || 'Verifikator';
  const isPIC = role === 'PIC';

  const isDaftarActive = currentPath === '/findings' || currentPath.startsWith('/findings/');
  const isTambahActive = currentPath === '/findings/create';
  const isVerifikasiActive = currentPath === '/verifications';
  const isDashboardActive = currentPath === '/' || currentPath === '/dashboard';
  const isLaporanActive = currentPath === '/reports';
  const isProfilActive = currentPath === '/profile';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#600505] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div className="p-6 border-b border-red-900/40 relative">
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 text-red-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Official UMM Logo */}
            <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md flex-shrink-0">
              <img src="/images/umm_logo.png" alt="Logo UMM" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-white flex items-center">
                UMM
              </div>
              <div className="text-[10px] text-red-200 uppercase tracking-widest font-semibold">
                Universitas Muhammadiyah Malang
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h1 className="text-lg font-bold text-white leading-tight">SIMATAP UMM</h1>
            <p className="text-[11px] text-red-200/90 leading-snug mt-0.5">
              Sistem Manajemen Asesmen Internal Perguruan Tinggi
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 custom-scrollbar">
          {/* Dashboard */}
          <button
            onClick={() => { navigate('/dashboard'); onClose(); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isDashboardActive
                ? 'bg-[#800808] text-white shadow-xs font-semibold'
                : 'text-red-100/85 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {/* Temuan AL (Collapsible) */}
          <div>
            <button
              onClick={() => setTemuanExpanded(!temuanExpanded)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isDaftarActive || isTambahActive
                  ? 'bg-[#730606] text-white font-semibold'
                  : 'text-red-100/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="w-4 h-4" />
                <span>Temuan AL</span>
              </div>
              {temuanExpanded ? (
                <ChevronDown className="w-4 h-4 text-red-200" />
              ) : (
                <ChevronRight className="w-4 h-4 text-red-200" />
              )}
            </button>

            {temuanExpanded && (
              <div className="mt-1 pl-4 pr-1 space-y-1">
                <button
                  onClick={() => { navigate('/findings'); onClose(); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-md text-xs font-medium transition-all ${
                    currentPath === '/findings' || (currentPath.startsWith('/findings/') && currentPath !== '/findings/create')
                      ? 'bg-[#800808] text-white font-semibold'
                      : 'text-red-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    currentPath === '/findings' || (currentPath.startsWith('/findings/') && currentPath !== '/findings/create')
                      ? 'bg-red-300'
                      : 'bg-red-400/50'
                  }`} />
                  <span>Daftar Temuan</span>
                </button>

                {/* Tambah Temuan (Admin & Asesor/Verifikator only) */}
                {!isPIC && (
                  <button
                    onClick={() => { navigate('/findings/create'); onClose(); }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-md text-xs font-medium transition-all ${
                      isTambahActive
                        ? 'bg-[#800808] text-white font-semibold'
                        : 'text-red-200 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isTambahActive ? 'bg-red-300' : 'bg-red-400/50'
                    }`} />
                    <span>Tambah Temuan</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Verifikasi Temuan (Admin & Asesor/Verifikator only) */}
          {!isPIC && (
            <button
              onClick={() => { navigate('/verifications'); onClose(); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isVerifikasiActive
                  ? 'bg-[#800808] text-white shadow-xs font-semibold'
                  : 'text-red-100/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Verifikasi Temuan</span>
            </button>
          )}

          {/* Laporan */}
          <button
            onClick={() => { navigate('/reports'); onClose(); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isLaporanActive
                ? 'bg-[#800808] text-white shadow-xs font-semibold'
                : 'text-red-100/85 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Laporan</span>
          </button>

          {/* Profil */}
          <button
            onClick={() => { navigate('/profile'); onClose(); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isProfilActive
                ? 'bg-[#800808] text-white shadow-xs font-semibold'
                : 'text-red-100/85 hover:bg-white/10 hover:text-white'
            }`}
          >
            <UserCircle2 className="w-4 h-4" />
            <span>Profil</span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-200 hover:bg-white/10 hover:text-white transition-all pt-3 border-t border-red-900/40 mt-3"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Current User Badge Bottom */}
        <div className="p-4 bg-black/20 border-t border-red-900/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm border border-white/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user?.name || 'Pengguna'}</div>
              <div className="text-[11px] text-red-200 truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {user?.role || 'Asesor'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
