import React, { useState, useMemo } from 'react';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  placeholder?: string;
}

const COMMON_ICONS = [
  { name: 'fa-solid fa-house', label: 'Home' },
  { name: 'fa-solid fa-briefcase', label: 'Work' },
  { name: 'fa-solid fa-book', label: 'Education' },
  { name: 'fa-solid fa-cart-shopping', label: 'Shopping' },
  { name: 'fa-solid fa-heart', label: 'Favorite' },
  { name: 'fa-solid fa-star', label: 'Star' },
  { name: 'fa-solid fa-folder', label: 'Folder' },
  { name: 'fa-solid fa-gear', label: 'Settings' },
  { name: 'fa-solid fa-info-circle', label: 'Info' },
  { name: 'fa-solid fa-palette', label: 'Art' },
  { name: 'fa-solid fa-music', label: 'Music' },
  { name: 'fa-solid fa-gamepad', label: 'Gaming' },
  { name: 'fa-solid fa-film', label: 'Movies' },
  { name: 'fa-solid fa-camera', label: 'Photos' },
  { name: 'fa-solid fa-envelope', label: 'Mail' },
  { name: 'fa-solid fa-phone', label: 'Phone' },
  { name: 'fa-solid fa-location-dot', label: 'Location' },
  { name: 'fa-solid fa-calendar', label: 'Calendar' },
  { name: 'fa-solid fa-clock', label: 'Time' },
  { name: 'fa-solid fa-cloud', label: 'Cloud' },
  { name: 'fa-solid fa-bolt', label: 'Flash' },
  { name: 'fa-solid fa-fire', label: 'Hot' },
  { name: 'fa-solid fa-drop', label: 'Water' },
  { name: 'fa-solid fa-leaf', label: 'Nature' },
  { name: 'fa-solid fa-face-smile', label: 'Smile' },
  { name: 'fa-solid fa-user', label: 'User' },
  { name: 'fa-solid fa-graduation-cap', label: 'Learning' },
  { name: 'fa-solid fa-laptop', label: 'Tech' },
  { name: 'fa-solid fa-dumbbell', label: 'Fitness' },
  { name: 'fa-solid fa-utensils', label: 'Food' },
  { name: 'fa-solid fa-plane', label: 'Travel' },
  { name: 'fa-solid fa-car', label: 'Auto' },
  { name: 'fa-solid fa-bicycle', label: 'Bike' },
  { name: 'fa-solid fa-wallet', label: 'Finance' },
  { name: 'fa-solid fa-credit-card', label: 'Payment' },
  { name: 'fa-solid fa-lock', label: 'Security' },
  { name: 'fa-solid fa-key', label: 'Access' },
  { name: 'fa-solid fa-magnifying-glass', label: 'Search' },
  { name: 'fa-solid fa-bell', label: 'Alert' },
  { name: 'fa-solid fa-comment', label: 'Chat' },
  { name: 'fa-solid fa-share-nodes', label: 'Share' },
  { name: 'fa-solid fa-download', label: 'Download' },
  { name: 'fa-solid fa-upload', label: 'Upload' },
  { name: 'fa-solid fa-trash', label: 'Delete' },
  { name: 'fa-solid fa-pen', label: 'Edit' },
  { name: 'fa-solid fa-plus', label: 'Add' },
  { name: 'fa-solid fa-check', label: 'Confirm' },
  { name: 'fa-solid fa-xmark', label: 'Close' },
  { name: 'fa-solid fa-circle-info', label: 'Detail' },
  { name: 'fa-solid fa-circle-question', label: 'Help' },
];

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, placeholder = '選擇圖標' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    return COMMON_ICONS.filter(icon => 
      icon.label.toLowerCase().includes(search.toLowerCase()) || 
      icon.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-primary transition-all group"
      >
        <div className="flex items-center gap-3">
          <i className={`${value || 'fa-solid fa-circle-question'} text-lg text-slate-600 group-hover:text-primary`}></i>
          <span className="text-sm text-slate-600">{value ? value.split(' ').pop() : placeholder}</span>
        </div>
        <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">選擇圖標</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜尋圖標..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto p-1">
                {filteredIcons.map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => {
                      onChange(icon.name);
                      setIsOpen(false);
                    }}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all ${value === icon.name ? 'bg-[#2f4dd5] text-white border-[#2f4dd5]' : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:bg-slate-50'}`}
                    title={icon.label}
                  >
                    <i className={`${icon.name} text-xl`}></i>
                  </button>
                ))}
                {filteredIcons.length === 0 && (
                  <div className="col-span-5 text-center py-8 text-slate-400 text-sm">
                    找不到符合的圖標
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-all"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
