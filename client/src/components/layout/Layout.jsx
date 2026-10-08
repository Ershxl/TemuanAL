import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout({ children, currentPath, navigate, titleOverride, breadcrumbOverride }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentPath={currentPath}
        navigate={navigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Header
          currentPath={currentPath}
          navigate={navigate}
          onMenuClick={() => setIsSidebarOpen(true)}
          titleOverride={titleOverride}
          breadcrumbOverride={breadcrumbOverride}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
