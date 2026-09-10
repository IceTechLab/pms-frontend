import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { ToastContainer } from '../ui/toast-container';

export function AppShell() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/doctorLogin' ||
    pathname === '/doctorSignup';

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center">
        <Outlet />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main className="pt-16 flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </main>
        <ToastContainer />
      </div>
    </div>
  );
}
