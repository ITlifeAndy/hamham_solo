import React from 'react';

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'add', label: 'Add', icon: 'add_circle' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 backdrop-blur-lg lg:hidden bg-white/80 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 shadow-lg dark:shadow-none font-display-hero text-[10px] font-semibold">
      {tabs.map((tab) => (
        <div 
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center justify-center rounded-2xl px-4 py-1 active:scale-90 duration-200 cursor-pointer ${
            activeTab === tab.id 
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' 
              : 'text-slate-400 dark:text-slate-500 hover:text-blue-500'
          }`}
        >
          <span className="material-symbols-outlined">{tab.icon}</span>
          <span>{tab.label}</span>
        </div>
      ))}
    </footer>
  );
};
