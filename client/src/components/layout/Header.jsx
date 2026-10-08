import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, ChevronDown, Check, LogOut, Shield, UserCheck, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export function Header({ onMenuClick, currentPath, navigate, titleOverride, breadcrumbOverride }) {
  const { user, logout, login } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick account switch helper for testing demo
  const handleQuickSwitch = async (username, password) => {
    try {
      setShowProfileDropdown(false);
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  // Determine Title and Breadcrumb
  const getHeaderInfo = () => {
    if (titleOverride && breadcrumbOverride) {
      return { title: titleOverride, breadcrumb: breadcrumbOverride };
    }

    if (currentPath === '/' || currentPath === '/dashboard') {
      return {
        title: 'Dashboard Temuan Asesmen Lapangan',
        breadcrumb: [{ label: 'Home', isRed: true }, { label: 'Dashboard' }]
      };
    }
    if (currentPath === '/findings') {
      return {
        title: 'Daftar Temuan',
        breadcrumb: [{ label: 'Home', isRed: true }, { label: 'Temuan AL' }, { label: 'Daftar Temuan' }]
      };
    }
    if (currentPath === '/findings/create') {
      return {
        title: 'Tambah Temuan Baru',
        breadcrumb: [{ label: 'Home', isRed: true }, { label: 'Temuan AL' }, { label: 'Tambah Temuan' }]
      };
    }
    if (currentPath.startsWith('/findings/')) {
      return {
        title: 'Detail Temuan',
        breadcrumb: [{ label: 'Home', isRed: true }, { label: 'Temuan AL' }, { label: 'Daftar Temuan' }, { label: 'Detail Temuan' }]
      };
    }
    if (currentPath === '/verifications') {
      return {
        title: 'Verifikasi Temuan',
        breadcrumb: [{ label: 'Home', isRed: true }, { label: 'Temuan AL' }, { label: 'Verifikasi Temuan' }]
      };
    }
    if (currentPath === '/reports') {
      return {
        title: 'Laporan Temuan',
        breadcrumb: [{ label: 'Home', isRed: true }, { label: 'Laporan' }, { label: 'Laporan Temuan' }]
      };
    }
    if (currentPath === '/profile') {
      return {
        title: 'Profil Pengguna',
        breadcrumb: [{ label: 'Home', isRed: true }, { label: 'Profil' }]
      };
    }

    return {
      title: 'SIMATAP UMM',
      breadcrumb: [{ label: 'Home', isRed: true }]
    };
  };

  const { title, breadcrumb } = getHeaderInfo();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-gray-200 px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between">
        {/* Left: Hamburger & Title / Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight">
              {title}
            </h1>
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
              {breadcrumb.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-gray-300">/</span>}
                  <span className={item.isRed ? 'text-red-700 font-semibold cursor-pointer hover:underline' : 'text-gray-500'}>
                    {item.label}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Notification Center */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">Notifikasi</h4>
                    {unreadCount > 0 && (
                      <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-brand-900 hover:underline font-medium"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      Tidak ada notifikasi saat ini
                    </div>
                  ) : (
                    notifications.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          markAsRead(item.id);
                          if (item.finding_id) {
                            navigate(`/findings/${item.finding_id}`);
                            setShowNotifDropdown(false);
                          }
                        }}
                        className={`p-3.5 hover:bg-gray-50 transition-colors cursor-pointer text-left ${
                          !item.is_read ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2.5 p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-700 font-semibold text-sm">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-gray-800 leading-tight">
                  {user?.name || 'Asesor UMM'}
                </div>
                <div className="text-[10px] text-gray-500 capitalize">
                  {user?.role === 'Verifikator' ? 'Asesor UMM' : (user?.role || 'Pengguna')}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Profile Dropdown & Quick Switch for Testing */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Masuk sebagai</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-brand-900 font-medium">{user?.email}</p>
                </div>

                {/* Quick Role Switcher Demo Tool */}
                <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/60">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Ganti Role Cepat (Demo):
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => handleQuickSwitch('admin', 'admin123')}
                      className={`text-[11px] py-1 px-1.5 rounded text-center font-medium border ${
                        user?.role === 'Admin'
                          ? 'bg-brand-900 text-white border-brand-900'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => handleQuickSwitch('asesor', 'asesor123')}
                      className={`text-[11px] py-1 px-1.5 rounded text-center font-medium border ${
                        user?.role === 'Verifikator' || user?.role === 'Asesor'
                          ? 'bg-brand-900 text-white border-brand-900'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      Asesor
                    </button>
                    <button
                      onClick={() => handleQuickSwitch('pic_sarpras', 'pic123')}
                      className={`text-[11px] py-1 px-1.5 rounded text-center font-medium border ${
                        user?.role === 'PIC'
                          ? 'bg-brand-900 text-white border-brand-900'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      PIC
                    </button>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-xs text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Lihat & Ubah Profil</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-xs text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
