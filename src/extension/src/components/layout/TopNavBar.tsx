import React, { useEffect, useState, useRef } from 'react';
import { authApi } from '../../api/auth';
import { resolveAvatarUrl } from '../../api/client';
import { ProfileSettingsModal } from '../admin/ProfileSettingsModal';
import { useHostUrl } from '../../hooks/useHostUrl';

interface TopNavBarProps {
  user: any;
  refreshUser: () => Promise<void>;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ user, refreshUser }) => {
  const hostUrl = useHostUrl();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('zh-TW', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const handleLogout = async () => {
    await authApi.logout();
    window.location.reload();
  };

  return (
    <>
      <header className="flex justify-between items-center w-full px-6 py-2 sticky top-0 z-50 bg-white bg-opacity-90 backdrop-blur-md border-b border-slate-100 shadow-[0_0_0_1px_rgba(224,226,232,1)] font-['Epilogue'] antialiased">
        <div className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center bg-transparent">
            <img alt="HamHam Logo" className="w-full h-full object-contain" src="/logob.png" />
          </div>
          <span>HamHam</span>
        </div>
        <div className="hidden md:flex items-center px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100">
          <span className="material-symbols-outlined text-slate-400 text-lg mr-2">schedule</span>
          <span className="text-xs font-medium text-slate-600 font-['Epilogue'] tracking-tight">
            {formattedDate}
          </span>
        </div>
        <div className="flex items-center gap-3 relative">
          <div 
            className="relative" 
            ref={menuRef}
          >
<div 
  className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border-2 border-primary/20 cursor-pointer hover:opacity-80 transition-opacity"
  onClick={() => setIsMenuOpen(!isMenuOpen)}
>
   <img alt="User profile" src={resolveAvatarUrl(user?.avatar, hostUrl) || "https://api.dicebear.com/7.x/avataaars/svg?seed=HamHam"} className="w-full h-full object-cover" />
</div>


            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-[60] animate-in fade-in zoom-in-95 duration-100">
                 <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">版本號：1.4</div>
                 <button 
                   onClick={() => { setIsSettingsOpen(true); setIsMenuOpen(false); }}
                   className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                 >
                   <span className="material-symbols-outlined text-lg">person</span>
                   設定個人資料
                 </button>
                  <button 
                    onClick={() => window.location.hash = '/settings/wallpaper'}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">image</span>
                    設定桌布
                  </button>
                   <button 
                     onClick={() => { window.location.hash = '/import-public'; setIsMenuOpen(false); }}
                     className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                   >
                    <span className="material-symbols-outlined text-lg">download</span>
                    導入公用書籤
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                   <span className="material-symbols-outlined text-lg">logout</span>
                   登出
                 </button>                  
              </div>
            )}
          </div>
        </div>
      </header>
      <ProfileSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onUserUpdated={refreshUser}
        user={user} 
      />
    </>
  );
};
