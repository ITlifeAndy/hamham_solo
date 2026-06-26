import React from 'react';

interface BookmarkItemProps {
  title: string;
  subtitle?: string;
  url: string;
  iconUrl?: string;
  isFavorite?: boolean;
  mode?: 'list' | 'moodboard';
}

export const BookmarkItem: React.FC<BookmarkItemProps> = ({ title, subtitle, url, iconUrl, isFavorite, mode = 'list' }) => {
  if (mode === 'moodboard') {
    return (
      <div className="aspect-square bg-white rounded-xl border border-border-ring overflow-hidden group relative cursor-pointer">
        <img 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
          src={iconUrl || 'https://via.placeholder.com/150'} 
          alt={title}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-lg">favorite</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border-ring text-text-primary hover:bg-slate-50 transition-all cursor-pointer group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        {subtitle ? (
          <p className="text-xs text-text-secondary truncate">{subtitle}</p>
        ) : (
          <p className="text-xs text-text-secondary truncate">{url}</p>
        )}
      </div>
      {isFavorite && (
        <span className="text-yellow-400 text-xs">★</span>
      )}
    </div>
  );
};
