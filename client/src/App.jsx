import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { FindingsListPage } from './pages/FindingsListPage';
import { CreateFindingPage } from './pages/CreateFindingPage';
import { FindingDetailPage } from './pages/FindingDetailPage';
import { VerificationPage } from './pages/VerificationPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname !== '/' ? window.location.pathname : '/dashboard';
  });

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#600505] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Memuat SIMATAP UMM...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => navigate('/dashboard')} />;
  }

  // Route matching
  const renderCurrentPage = () => {
    if (currentPath === '/' || currentPath === '/dashboard') {
      return <DashboardPage navigate={navigate} />;
    }

    if (currentPath === '/findings') {
      const urlParams = new URLSearchParams(window.location.search);
      const statusFilter = urlParams.get('status') || '';
      return <FindingsListPage navigate={navigate} initialStatusFilter={statusFilter} />;
    }

    if (currentPath === '/findings/create') {
      return <CreateFindingPage navigate={navigate} />;
    }

    if (currentPath.startsWith('/findings/')) {
      const findingId = currentPath.replace('/findings/', '').split('?')[0];
      return <FindingDetailPage findingId={findingId} navigate={navigate} />;
    }

    if (currentPath === '/verifications') {
      return <VerificationPage navigate={navigate} />;
    }

    if (currentPath === '/reports') {
      return <ReportsPage />;
    }

    if (currentPath === '/profile') {
      return <ProfilePage />;
    }

    // Default fallback
    return <DashboardPage navigate={navigate} />;
  };

  return (
    <Layout currentPath={currentPath} navigate={navigate}>
      {renderCurrentPage()}
    </Layout>
  );
}
