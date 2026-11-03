import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { Sidebar } from './Sidebar.js';
import { BottomNav } from './BottomNav.js';
import { QuickObservationModal } from '../observations/QuickObservationModal.js';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickObsOpen, setQuickObsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1F2937] flex flex-col font-sans">
      {/* Sidebar for desktop & drawer for mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col flex-1 min-w-0">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenQuickObservation={() => setQuickObsOpen(true)}
        />

        <main className="flex-1 p-3 sm:p-5 md:p-6 pb-20 md:pb-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openQuickObservation: () => setQuickObsOpen(true) }} />
        </main>

        <BottomNav
          onOpenQuickObservation={() => setQuickObsOpen(true)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </div>

      {/* High-Priority Quick Observation Modal Accessible from anywhere */}
      <QuickObservationModal
        isOpen={quickObsOpen}
        onClose={() => setQuickObsOpen(false)}
      />
    </div>
  );
};
