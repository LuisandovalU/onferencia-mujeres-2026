import React, { useEffect, useState } from 'react';
import { BarChart3, QrCode, ClipboardList, LogOut, Users } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function AdminTabs() {
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const tabs: Tab[] = [
    { id: 'stats', label: 'Estadísticas', href: '/admin/dashboard', icon: <BarChart3 size={18} /> },
    { id: 'attendees', label: 'Asistentes', href: '/admin/asistentes', icon: <Users size={18} /> },
    { id: 'checkin', label: 'Escáner QR', href: '/admin/checkin', icon: <QrCode size={18} /> },
    { id: 'manual', label: 'Registro Manual', href: '/admin/registro-manual', icon: <ClipboardList size={18} /> },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('admin_password');
    window.location.href = '/admin/registro-manual'; // Redirigir al inicio o login
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-[100] md:relative md:bottom-auto md:top-0 px-4 pb-8 md:pb-0 md:mb-8 pointer-events-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-2 glass-card rounded-[2.5rem] pointer-events-auto shadow-2xl shadow-black/50 border-t-white/20 border-b-white/5 border-x-white/10 backdrop-blur-3xl">
        <div className="flex flex-1 md:flex-none justify-around md:justify-start gap-2">
          {tabs.map((tab) => {
            const isActive = currentPath === tab.href;
            return (
              <a
                key={tab.id}
                href={tab.href}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-3xl font-bold transition-all duration-300 uppercase tracking-tighter text-[9px] md:text-xs
                  ${isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105 md:scale-100' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className={`${isActive ? 'scale-110' : ''} transition-transform duration-300`}>
                  {tab.icon}
                </div>
                <span className="md:inline">{tab.label}</span>
              </a>
            );
          })}
        </div>
        
        <button
          onClick={handleLogout}
          className="hidden md:flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 uppercase tracking-tighter text-xs"
        >
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </div>
    </nav>
  );
}
