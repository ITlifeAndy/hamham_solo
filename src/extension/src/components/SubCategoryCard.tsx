import React, { useState } from 'react';
import type { Category, Bookmark } from '../api/types';
import { bookmarkApi } from '../api/bookmarks';
import { useWallpaper } from '../providers/WallpaperProvider';

interface UnifiedItem {
  itemId: string;
  type: 'Bookmark' | 'Category';
  sortOrder: number;
  data: any;
}

interface SubCategoryCardProps {
  sub: Category;
  unifiedItems: UnifiedItem[];
  onRefresh: () => void;
  onAddBookmark: (catId: string) => void;
  renderBookmark: (bm: Bookmark) => React.ReactNode;
  onDragStart: (e: React.DragEvent, id: string, type: 'Bookmark' | 'Category') => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string, targetType: 'Bookmark' | 'Category', currentCatId: string) => void;
  onEditCategory: (cat: Category) => void;
}

export const SubCategoryCard: React.FC<SubCategoryCardProps> = ({ 
  sub, 
  unifiedItems, 
  onRefresh, 
  onAddBookmark, 
  renderBookmark,
  onDragStart,
  onDragOver,
  onDrop,
  onEditCategory
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { isDarkWallpaper } = useWallpaper();
  const autoTextColor = isDarkWallpaper ? 'text-white' : 'text-on-primary-fixed-variant';
  const autoIconColor = isDarkWallpaper ? 'text-white' : 'text-on-primary-fixed-variant';
  
  const finalTextColor = sub.textColor || autoTextColor;
  const finalIconColor = sub.textColor || autoIconColor;

    return (
      <div 
        draggable
        onDragStart={(e) => onDragStart(e, sub.id, 'Category')}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, sub.id, 'Category', sub.categoryId || '')}
         className={`rounded-xl p-1 border cursor-move transition-all bg-white/40 border-white/60 hover:bg-white/60`}
    >
       <div 
         className="flex items-center justify-between mb-1 px-1 cursor-pointer group/sub-header" 
         onClick={() => setIsExpanded(!isExpanded)}
       >
          <div className="flex items-center gap-1.5">
            <i className={`fa-solid ${isExpanded ? 'fa-folder-open' : 'fa-folder'} text-[14px] ${sub.textColor ? '' : finalIconColor} transition-transform ${isExpanded ? 'rotate-0' : 'rotate-0'}`} style={sub.textColor ? { color: sub.textColor } : {}}></i>
            <span className={`text-[12px] uppercase tracking-wider font-bold ${sub.textColor ? '' : finalTextColor}`} style={sub.textColor ? { color: sub.textColor } : {}}>{sub.name}</span>
            <i className={`material-symbols-outlined text-xs ${sub.textColor ? '' : finalIconColor} transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} style={sub.textColor ? { color: sub.textColor } : {}}>
              expand_more
            </i>
          </div>
        <div className="flex items-center gap-1">
               <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   onEditCategory(sub);
                 }}
                   className={`opacity-0 group-hover/sub-header:opacity-100 p-1 hover:bg-white/50 rounded-full transition-all ${sub.textColor ? '' : (isDarkWallpaper ? 'text-white/70 hover:text-white' : 'text-on-primary-fixed-variant')}`}
                   style={sub.textColor ? { color: sub.textColor } : {}}
                   title="編輯類別"
                 >
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddBookmark(sub.id);
                  }}
                   className={`opacity-0 group-hover/sub-header:opacity-100 p-1 hover:bg-white/50 rounded-full transition-all ${sub.textColor ? '' : (isDarkWallpaper ? 'text-white/70 hover:text-white' : 'text-on-primary-fixed-variant')}`}
                   style={sub.textColor ? { color: sub.textColor } : {}}
                  title="新增書籤"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`確定要刪除類別 ${sub.name} 及其所有內容嗎？`)) {
                bookmarkApi.deleteCategory(sub.id).then(() => onRefresh());
              }
            }}
             className="opacity-0 group-hover/sub-header:opacity-100 p-0.5 hover:bg-white/50 rounded transition-all text-red-500"
            title="刪除類別"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>

      </div>
      
       {isExpanded && (
         <div className="flex flex-col gap-1.5 pl-1 border-l-2 border-primary/10 ml-2 animate-in slide-in-from-top-2 duration-200">
           {unifiedItems
              .filter(item => item.type === 'Bookmark' && (item.data.categoryId || item.data.categoriesId) === sub.id)
             .sort((a, b) => a.sortOrder - b.sortOrder)
             .map(item => renderBookmark(item.data))}
           {unifiedItems
             .filter(item => item.type === 'Bookmark' && item.data.categoryId === sub.id).length === 0 && (
               <div className="text-[10px] text-slate-400 italic px-2 py-1"></div>
             )}
         </div>
       )}
    </div>
  );
};
