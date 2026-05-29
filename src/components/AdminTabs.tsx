import React, { useEffect, useState } from 'react';
import { BarChart3, QrCode, ClipboardList, LogOut, Users, Activity } from 'lucide-react';

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
    { id: 'monitor', label: 'Monitor Brave', href: '/admin/monitor-brave', icon: <Activity size={18} /> },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('admin_password');
    window.location.href = '/admin/registro-manual'; // Redirigir al inicio o login
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-[100] md:relative md:bottom-auto md:top-0 px-2 md:px-6 pb-8 md:pb-0 md:mb-8 pointer-events-none">
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between p-2 glass-card rounded-[2rem] md:rounded-[2.5rem] pointer-events-auto shadow-2xl shadow-black/50 border-t-white/20 border-b-white/5 border-x-white/10 backdrop-blur-3xl overflow-hidden">
        <div className="flex w-full overflow-x-auto hide-scrollbar justify-start md:justify-center gap-1 md:gap-2 px-1">
          {tabs.map((tab) => {
            const isActive = currentPath === tab.href;
            return (
              <a
                key={tab.id}
                href={tab.href}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 min-w-[70px] md:min-w-0 md:px-5 md:py-3 rounded-[1.5rem] font-bold transition-all duration-300 uppercase tracking-tighter text-[9px] md:text-[11px] flex-shrink-0
                  ${isActive 
                    ? 'bg-gradient-to-r from-brave-forest to-brave-moss text-white shadow-lg shadow-black/40 ring-1 ring-white/10' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                <div className={`${isActive ? 'scale-110 text-emerald-400' : ''} transition-transform duration-300`}>
                  {tab.icon}
                </div>
                <span className="whitespace-nowrap">{tab.label}</span>
              </a>
            );
          })}
        </div>
        
        <button
          onClick={handleLogout}
          className="hidden md:flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 uppercase tracking-tighter text-xs ml-2"
        >
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </div>
    </nav>
  );
}
