import React from 'react';

export interface PublicBookmark {
  id: string;
  name: string;
  subtitle: string;
  url: string;
}

interface PublicLibraryListProps {
  bookmarks: PublicBookmark[];
  selectionMode?: boolean;
  selectedIds?: string[];
  onToggleSelection?: (id: string) => void;
}

export const PublicLibraryList: React.FC<PublicLibraryListProps> = ({ 
  bookmarks, 
  selectionMode = false, 
  selectedIds = [], 
  onToggleSelection 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookmarks.map(bookmark => (
        <div 
          key={bookmark.id}
          onClick={() => selectionMode && onToggleSelection && onToggleSelection(bookmark.id)}
          className={`p-4 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3 ${
            selectionMode && selectedIds.includes(bookmark.id) 
            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 cursor-pointer' 
            : 'border-slate-100 hover:border-slate-200 bg-white cursor-default'
          }`}
        >
          {selectionMode && (
            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selectedIds.includes(bookmark.id) 
              ? 'bg-primary border-primary' 
              : 'border-slate-300 bg-transparent'
            }`}>
              {selectedIds.includes(bookmark.id) && (
                <span className="text-white text-xs">✓</span>
              )}
            </div>
          )}
          <div className="overflow-hidden">
            <h3 className="font-bold text-slate-900 truncate">{bookmark.name}</h3>
            <p className="text-xs text-slate-500 truncate">{bookmark.subtitle}</p>
            <p className="text-[10px] text-slate-400 truncate mt-1">{bookmark.url}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
