import React from 'react';

export function StatusBadge({ status, className = '' }) {
  const normalized = (status || '').trim();

  // Status Colors based on design.md:
  // Open: Blue, Menunggu Verifikasi: Orange/Amber, Close: Green, Ditugaskan: Purple, Perlu Perbaikan: Rose/Red
  const getStyle = () => {
    switch (normalized) {
      case 'Open':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Menunggu Verifikasi':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Close':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Dalam Proses':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Ditugaskan':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Perlu Perbaikan':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 fill-current bg-current opacity-70"></span>
      {normalized || '-'}
    </span>
  );
}

export function PriorityBadge({ priority, className = '' }) {
  const normalized = (priority || '').trim();

  // Priority Colors based on design.md:
  // Tinggi: Merah (teks merah, latar merah muda)
  // Sedang: Oranye (teks oranye, latar oranye muda)
  // Rendah: Hijau (teks hijau, latar hijau muda)
  const getStyle = () => {
    switch (normalized) {
      case 'Tinggi':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'Sedang':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Rendah':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getStyle()} ${className}`}
    >
      {normalized || '-'}
    </span>
  );
}

export function DecisionBadge({ decision, className = '' }) {
  switch (decision) {
    case 'Valid':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          ✓ Valid
        </span>
      );
    case 'Valid dengan Catatan':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          ⚠ Valid dgn Catatan
        </span>
      );
    case 'Tidak Valid':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
          ✕ Tidak Valid
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 ${className}`}>
          {decision}
        </span>
      );
  }
}

export function ActivityBadge({ type, className = '' }) {
  // design.md 2.2: Create: Biru, Update: Ungu
  switch (type) {
    case 'Create':
      return <span className={`px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-700 ${className}`}>Create</span>;
    case 'Update':
      return <span className={`px-2 py-0.5 text-xs font-semibold rounded bg-purple-100 text-purple-700 ${className}`}>Update</span>;
    case 'FollowUp':
      return <span className={`px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 ${className}`}>Tindak Lanjut</span>;
    case 'Verify':
      return <span className={`px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 ${className}`}>Verifikasi</span>;
    case 'StatusChange':
      return <span className={`px-2 py-0.5 text-xs font-semibold rounded bg-indigo-100 text-indigo-700 ${className}`}>Ubah Status</span>;
    default:
      return <span className={`px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-700 ${className}`}>{type}</span>;
  }
}
