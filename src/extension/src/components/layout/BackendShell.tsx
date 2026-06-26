import React, { useState } from 'react';
import { UserManagement } from '../admin/UserManagement';
import { PublicLibrary } from '../admin/PublicLibrary';
import { PublicBookmarkManagement } from '../admin/PublicBookmarkManagement';

interface BackendShellProps {
  primaryAction?: {
    label: string;
    icon: string;
    onClick: () => void;
  };
}

export const BackendShell: React.FC<BackendShellProps> = ({ primaryAction }) => {
  const [activeModule, setActiveModule] = useState('users');

   const renderModule = () => {
     switch (activeModule) {
       case 'users':
         return {
           title: '使用者管理',
           action: primaryAction,
           component: <UserManagement />
         };
       case 'library':
         return {
           title: '公用書籤庫',
           action: null,
           component: <PublicLibrary />
         };
       case 'public-bookmarks':
         return {
           title: '公用書籤管理',
           action: null,
           component: <PublicBookmarkManagement />
         };
       default:
         return null;
     }
   };

  const current = renderModule();
  if (!current) return null;

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-standard">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-white border-r border-[#e9eaef] p-4 sticky top-0">
        <div className="space-y-2 flex-grow">
          <div className="flex flex-col mb-6 px-2">
            <span className="text-lg font-black text-black font-['Epilogue'] whitespace-nowrap">HamHam</span>
            <span className="text-xs text-slate-500 font-['Epilogue'] font-semibold whitespace-nowrap">後台管理</span>
          </div>
          <button 
            onClick={() => setActiveModule('users')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${activeModule === 'users' ? 'bg-blue-50 text-[#5b76fe]' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <span className="material-symbols-outlined whitespace-nowrap" style={{ fontVariationSettings: 'FILL 1' }}>group</span>
            <span className="font-['Epilogue'] text-sm font-semibold whitespace-nowrap">使用者管理</span>
          </button>
           {/* <button 
             onClick={() => setActiveModule('library')}
             className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${activeModule === 'library' ? 'bg-blue-50 text-[#5b76fe]' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             <span className="material-symbols-outlined whitespace-nowrap">bookmark</span>
             <span className="font-['Epilogue'] text-sm font-semibold whitespace-nowrap">公用書籤庫</span>
           </button> */}
           <button 
             onClick={() => setActiveModule('public-bookmarks')}
             className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${activeModule === 'public-bookmarks' ? 'bg-blue-50 text-[#5b76fe]' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             <span className="material-symbols-outlined whitespace-nowrap">settings_suggest</span>
             <span className="font-['Epilogue'] text-sm font-semibold whitespace-nowrap">公用書籤管理</span>
           </button>
           <div className="my-4 border-t border-slate-100" />
          <button 
            onClick={() => window.location.hash = ''}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-slate-600 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined whitespace-nowrap">home</span>
            <span className="font-['Epilogue'] text-sm font-semibold whitespace-nowrap">返回前端</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full">
        {/* Content Area */}
        <div className="w-full">
          {current.component}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e9eaef] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
          <div className="flex justify-around items-center py-3">
            <button 
              onClick={() => setActiveModule('users')}
              className={`flex flex-col items-center gap-1 ${activeModule === 'users' ? 'text-[#5b76fe]' : 'text-slate-400'}`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: 'FILL 1' }}>group</span>
              <span className="text-[10px] font-bold">Users</span>
            </button>
             <button 
               onClick={() => setActiveModule('library')}
               className={`flex flex-col items-center gap-1 ${activeModule === 'library' ? 'text-[#5b76fe]' : 'text-slate-400'}`}
             >
               <span className="material-symbols-outlined">bookmark</span>
               <span className="text-[10px] font-bold">Library</span>
             </button>
             <button 
               onClick={() => setActiveModule('public-bookmarks')}
               className={`flex flex-col items-center gap-1 ${activeModule === 'public-bookmarks' ? 'text-[#5b76fe]' : 'text-slate-400'}`}
             >
               <span className="material-symbols-outlined">settings_suggest</span>
               <span className="text-[10px] font-bold">Manage</span>
             </button>
             <button 
               onClick={() => window.location.hash = ''}
               className="flex flex-col items-center gap-1 text-slate-400"
             >
              <span className="material-symbols-outlined">home</span>
              <span className="text-[10px] font-bold">Home</span>
            </button>
          </div>
        </nav>
      </main>
    </div>
  );
};
