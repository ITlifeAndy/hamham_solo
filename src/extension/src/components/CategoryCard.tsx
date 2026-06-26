import React, { useEffect, useState } from 'react';
import type { Category, Bookmark } from '../api/types';
import { bookmarkApi } from '../api/bookmarks';
import { AddCategoryModal } from './AddCategoryModal';
import { SubCategoryCard } from './SubCategoryCard';
import { useWallpaper } from '../providers/WallpaperProvider';

const getContrastColor = (hexColor: string) => {
  if (hexColor === 'glass') return 'light';
  const color = hexColor.replace('#', '');
  if (color.length === 3) {
    const r = parseInt(color[0] + color[0], 16);
    const g = parseInt(color[1] + color[1], 16);
    const b = parseInt(color[2] + color[2], 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 128 ? 'light' : 'dark';
  }
  if (color.length === 6) {
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 128 ? 'light' : 'dark';
  }
  return 'light';
};

interface CategoryCardProps {
  category: Category;
  onCategoryUpdated?: () => void;
  setEditingCategory: (cat: Category | null) => void;
  setEditingBookmark: (bm: Bookmark | null) => void;
  refreshTrigger?: number;
  openAddBookmark: (catId: string) => void;
  draggedItem: { id: string, type: 'Bookmark' | 'Category', categoryId: string, data?: any } | null;
  setDraggedItem: (item: { id: string, type: 'Bookmark' | 'Category', categoryId: string, data?: any } | null) => void;
}

interface UnifiedItem {
  itemId: string;
  type: 'Bookmark' | 'Category';
  sortOrder: number;
  data: any;
}

interface BookmarkItemProps {
  bookmark: any;
  isDarkWallpaper: boolean;
  onDragStart: (e: React.DragEvent, id: string, type: 'Bookmark' | 'Category') => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string, targetType: 'Bookmark' | 'Category', currentCatId: string) => void;
  setEditingBookmark: (bm: Bookmark | null) => void;
  refreshData: () => void;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ 
   bookmark, 
   isDarkWallpaper, 
   onDragStart, 
   onDragOver, 
   onDrop, 
   setEditingBookmark, 
   refreshData 
 }) => {
   const isGlass = bookmark?.color === 'glass';
   const bookmarkContrast = getContrastColor(bookmark?.color || '#f4f2fe');
   const autoTextColor = isGlass 
     ? (isDarkWallpaper ? 'text-white' : 'text-slate-900') 
     : (bookmarkContrast === 'light' ? 'text-slate-900' : 'text-white');
   const autoNoteTextColor = isGlass 
     ? (isDarkWallpaper ? 'text-white/80' : 'text-slate-900/80') 
     : (bookmarkContrast === 'light' ? 'text-slate-900/80' : 'text-white/80');
   
   const finalTextColor = bookmark?.textColor || autoTextColor;
   const finalNoteTextColor = bookmark?.textColor ? `${bookmark.textColor}cc` : autoNoteTextColor; // approximate 80% opacity
   
   const title = bookmark?.title || bookmark?.name || '無名稱';
  const [isExpanded, setIsExpanded] = useState(false);
  const note = bookmark?.subtitle || '';

    return (
      <div 
        draggable
        onDragStart={(e) => onDragStart(e, bookmark?.id, 'Bookmark')}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, bookmark?.id, 'Bookmark', bookmark?.categoryId)}
        onClick={() => window.location.href = bookmark?.url}
       className={`p-1 rounded-xl flex items-center gap-2 transition-transform hover:-translate-y-0.5 active:scale-95 group cursor-move ${
         isGlass 
         ? 'border border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/40' 
         : (bookmark?.color && bookmark?.color !== '#f4f2fe') ? '' : 'border border-border-ring'
       }`}
      style={{ backgroundColor: isGlass ? 'transparent' : (bookmark?.color || '#f4f2fe') }}
    >
       <div className="flex-1 overflow-hidden">
           <h3 className={`font-bold text-sm truncate ${bookmark?.textColor ? '' : finalTextColor}`} style={bookmark?.textColor ? { color: bookmark.textColor } : {}}>{title}</h3>
           <div 
             className={`flex items-start gap-1`}
             onClick={(e) => e.stopPropagation()}
           >
             <div 
               draggable={false}
               onClick={(e) => {
                 e.stopPropagation();
                 setIsExpanded(!isExpanded);
               }}
               className={`text-xs mb-0.5 transition-all select-text cursor-pointer ${isExpanded ? 'whitespace-pre-wrap break-words' : 'truncate'} ${bookmark?.textColor ? '' : finalNoteTextColor}`}
               style={bookmark?.textColor ? { color: bookmark.textColor } : {}}
             >
               {isExpanded ? note : (note.length > 40 ? note.substring(0, 40) + '...' : note)}
             </div>
           </div>
       </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
             onClick={(e) => {
               e.stopPropagation();
               setEditingBookmark(bookmark);
             }}
             className={`p-1 ${isGlass ? (isDarkWallpaper ? 'text-white/70 hover:text-white' : 'text-slate-400 hover:text-primary') : 'text-slate-400 hover:text-primary'} ${bookmark?.textColor ? '' : ''}`}
             style={bookmark?.textColor ? { color: bookmark.textColor } : {}}
             title="編輯書籤"
           >
             <span className="material-symbols-outlined text-base">edit</span>
           </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('確定要刪除此書籤嗎？')) {
                bookmarkApi.deleteBookmark(bookmark.id).then(() => refreshData());
              }
            }}
            className={`p-1 ${isGlass ? (isDarkWallpaper ? 'text-red-300 hover:text-red-400' : 'text-slate-400 hover:text-red-500') : 'text-slate-400 hover:text-red-500'}`}
            title="刪除書籤"
          >
            <span className="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
    </div>
  );
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onCategoryUpdated, 
  setEditingCategory, 
  setEditingBookmark, 
  refreshTrigger, 
  openAddBookmark,
  draggedItem,
  setDraggedItem
}) => {
  const [unifiedItems, setUnifiedItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const { isDarkWallpaper } = useWallpaper();
  const contrast = getContrastColor(category.color || '#dee1ff');
  const autoTextColor = category.color === 'glass' 
    ? (isDarkWallpaper ? 'text-white' : 'text-slate-900') 
    : (contrast === 'light' ? 'text-slate-900' : 'text-white');
  const autoIconColor = category.color === 'glass' 
    ? (isDarkWallpaper ? 'text-white' : 'text-primary') 
    : (contrast === 'light' ? 'text-primary' : 'text-white');
  const hoverBg = contrast === 'light' ? 'hover:bg-black/10' : 'hover:bg-white/20';
  
  const finalTextColor = category.textColor || autoTextColor;
  const finalIconColor = category.textColor || autoIconColor;

  useEffect(() => {
    refreshData();
  }, [category.id, refreshTrigger]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const items = await bookmarkApi.getUnifiedItems(category.id);
      setUnifiedItems(items);
    } catch (err) {
      console.error(`Failed to load data for ${category.name}`, err);
    } finally {
      setLoading(false);
    }
  };

  const onDragStart = (e: React.DragEvent, id: string, type: 'Bookmark' | 'Category') => {
    e.stopPropagation();
    // Determine the current category ID and data of the item being dragged
    const item = unifiedItems.find(i => i.itemId === id);
     const categoryId = item?.data.categoryId || item?.data.categoriesId || item?.data.parentId || category.id;
    setDraggedItem({ id, type, categoryId, data: item?.data });
  };

  const itemsRef = React.useRef<UnifiedItem[]>([]);

  useEffect(() => {
    itemsRef.current = unifiedItems;
  }, [unifiedItems]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

    const onDrop = async (e: React.DragEvent, targetId: string, _targetType: 'Bookmark' | 'Category', targetCatId: string) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!draggedItem || (draggedItem.id === targetId)) return;
      
      // Determine the correct target category ID
      let finalTargetCatId = targetCatId;
      if (_targetType === 'Category') {
        finalTargetCatId = targetId;
      } else {
        const targetItem = unifiedItems.find(i => i.itemId === targetId);
        if (targetItem) {
           finalTargetCatId = targetItem.data.categoryId || targetItem.data.categoriesId || targetItem.data.parentId || targetCatId;
        }
      }
      
      const getParentId = (item: UnifiedItem) => {
        if (!item.data) return null;
         return item.data.categoryId || item.data.categoriesId || item.data.parentId;
      };
      
      // Rule: Same Category -> Adjust Order
      if (draggedItem.categoryId === finalTargetCatId) {
        const currentItems = itemsRef.current;
        const directChildren = currentItems
          .filter(item => getParentId(item) === finalTargetCatId)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      
        const draggedIdx = directChildren.findIndex(i => i.itemId === draggedItem.id);
        const targetIdx = directChildren.findIndex(i => i.itemId === targetId);
      
        if (draggedIdx === -1 || targetIdx === -1) {
          setDraggedItem(null);
          return;
        }
      
        const updatedList = [...directChildren];
        const [draggedItemObj] = updatedList.splice(draggedIdx, 1);
        updatedList.splice(targetIdx, 0, draggedItemObj);
      
        try {
          await bookmarkApi.updateUnifiedOrder(finalTargetCatId, updatedList.map((item, index) => ({
            itemId: item.itemId,
            type: item.type,
            sortOrder: index
          })));
          
          setUnifiedItems(prevItems => 
            prevItems.map(item => {
              if (getParentId(item) === finalTargetCatId) {
                const newIdx = updatedList.findIndex(i => i.itemId === item.itemId);
                return { ...item, sortOrder: newIdx };
              }
              return item;
            })
          );
        } catch (err) {
          console.error('Failed to update unified order', err);
          refreshData();
        }
      } else {
        // Rule: Different Category -> Move Item
        try {
           if (draggedItem.type === 'Bookmark') {
             const bookmarkData = draggedItem.data || {};
              await bookmarkApi.updateBookmark(draggedItem.id, { 
                categoryId: finalTargetCatId,
                title: bookmarkData.title || bookmarkData.name,
                url: bookmarkData.url,
                color: bookmarkData.color,
                subtitle: bookmarkData.subtitle,
                isFavorite: bookmarkData.isFavorite,
              });
            } else {
              const categoryData = draggedItem.data || {};
              await bookmarkApi.updateCategory(draggedItem.id, { 
                parentId: finalTargetCatId,
                name: categoryData.name,
                color: categoryData.color,
                icon: categoryData.icon,
              });
            }
          
          await refreshData();
          onCategoryUpdated?.();
        } catch (err) {
          console.error('Failed to move item to different category', err);
        }
      }
      
      setDraggedItem(null);
    };

  const openAddBookmarkInternal = (catId: string) => {
    openAddBookmark(catId);
  };

    return (
      <div 
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, category.id, 'Category', category.id)}
        className={`p-1 rounded-2xl border shadow-sm transition-all hover:shadow-md h-fit ${
          category.color === 'glass' 
          ? 'border-white/40 bg-white/30 backdrop-blur-md backdrop-saturate-150' 
          : 'border-white/40'
        }`}
        style={{ backgroundColor: category.color === 'glass' ? 'transparent' : (category.color || '#dee1ff') }}
      >

       <div className="flex justify-between items-center mb-4 group/cat-header">
         <div className="flex items-center gap-2">
           <i className={`${(category as any).icon || 'fa-solid fa-folder'} ${category.textColor ? '' : finalIconColor} text-xl`} style={category.textColor ? { color: category.textColor } : {}}></i>
           <h2 className={`font-feature-label text-base ${category.textColor ? '' : finalTextColor}`} style={category.textColor ? { color: category.textColor } : {}}>{category.name}</h2>
         </div>
          <div className="flex items-center gap-1 relative opacity-0 group-hover/cat-header:opacity-100 transition-opacity">
               <button 
                 onClick={() => setShowAddMenu(!showAddMenu)}
                 className={`p-1 ${hoverBg} rounded-full transition-colors ${category.textColor ? '' : finalIconColor}`}
                 style={category.textColor ? { color: category.textColor } : {}}
                 title="新增"
               >
                 <span className="material-symbols-outlined text-lg">add</span>
               </button>
               <button 
                 onClick={() => setEditingCategory(category)}
                 className={`p-1 ${hoverBg} rounded-full transition-colors ${category.textColor ? '' : finalIconColor}`}
                 style={category.textColor ? { color: category.textColor } : {}}
                 title="編輯類別"
               >
                 <span className="material-symbols-outlined text-lg">edit</span>
               </button>
              <button 
                onClick={() => {
                  if (confirm(`確定要刪除類別 ${category.name} 及其所有內容嗎？`)) {
                    bookmarkApi.deleteCategory(category.id).then(() => {
                      onCategoryUpdated?.();
                    });
                  }
                }}
                className={`p-1 ${hoverBg} rounded-full transition-colors text-red-500 hover:bg-red-100`}
                title="刪除類別"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
  
               {showAddMenu && (
                 <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-[60] animate-in fade-in zoom-in-95 duration-100">
                    <button 
                      onClick={() => {
                        openAddBookmark(category.id);
                        setShowAddMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg text-slate-400">link</span>
                      新增書籤
                    </button>
                   <button 
                     onClick={() => {
                       setIsAddCategoryModalOpen(true);
                       setShowAddMenu(false);
                     }}
                     className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                   >
                     <span className="material-symbols-outlined text-lg text-slate-400">create_new_folder</span>
                     新增子類別
                   </button>
                 </div>
               )}
             </div>
        </div>
        
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="text-xs text-text-secondary italic">Loading...</div>
            ) : (
              <>
                 {unifiedItems
                     .filter(item => (item.data.categoryId || item.data.categoriesId) === category.id)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map(item => {
                      if (item.type === 'Bookmark') return (
                        <BookmarkItem 
                          key={item.itemId}
                          bookmark={item.data}
                          isDarkWallpaper={isDarkWallpaper}
                          onDragStart={(e, id, type) => onDragStart(e, id, type)}
                          onDragOver={onDragOver}
                          onDrop={onDrop}
                          setEditingBookmark={setEditingBookmark}
                          refreshData={refreshData}
                        />
                      );
                      if (item.type === 'Category') return (
                        <SubCategoryCard 
                          key={item.itemId}
                          sub={item.data}
                          unifiedItems={unifiedItems}
                          onRefresh={refreshData}
                          onAddBookmark={openAddBookmarkInternal}
                          renderBookmark={(bm) => (
                            <BookmarkItem 
                              bookmark={bm}
                              isDarkWallpaper={isDarkWallpaper}
                              onDragStart={(e, id, type) => onDragStart(e, id, type)}
                              onDragOver={onDragOver}
                              onDrop={onDrop}
                              setEditingBookmark={setEditingBookmark}
                              refreshData={refreshData}
                            />
                          )}
                          onDragStart={(e, id, type) => onDragStart(e, id, type)}
                          onDragOver={onDragOver}
                          onDrop={onDrop}
                          onEditCategory={setEditingCategory}
                        />
                      );
                      return null;
                    })}
                 
                     {unifiedItems.filter(item => (item.data.categoryId || item.data.categoriesId) === category.id).length === 0 && (
                      <div className="text-xs text-text-secondary italic"></div>
                    )}
               </>
            )}
          </div>
 
           <AddCategoryModal 
             isOpen={isAddCategoryModalOpen} 
             onClose={() => setIsAddCategoryModalOpen(false)} 
             onCategoryAdded={refreshData} 
             defaultParentId={category.id}
           />
         </div>
     );
};
