import React, { useState, useEffect } from 'react';
import { CategoryCard } from './components/CategoryCard';
import { AuthModal } from './components/AuthModal';
import { TopNavBar } from './components/layout/TopNavBar';
import { BottomNavBar } from './components/layout/BottomNavBar';
import { BackendShell } from './components/layout/BackendShell';
import { AddCategoryModal } from './components/AddCategoryModal';
import { EditCategoryModal } from './components/EditCategoryModal';
import { EditBookmarkModal } from './components/EditBookmarkModal';
import { AddBookmarkModal } from './components/AddBookmarkModal';
import { WallpaperSettingsPage } from './components/WallpaperSettingsPage';
import { PublicBookmarkImport } from './components/PublicBookmarkImport';
import { bookmarkApi, initializeDataFromSheet } from './api/bookmarks';
import type { Category, Bookmark } from './api/types';
import { storage } from './services/storage';
import { useWallpaper } from './providers/WallpaperProvider';
import { useHostUrl } from './hooks/useHostUrl';

import { resolveWallpaperUrl } from './utils/wallpaper';

const App: React.FC = () => {
  const { wallpaperUrl, overlayOpacity, isDarkWallpaper, refreshSettings } = useWallpaper();
  const hostUrl = useHostUrl();
  const resolvedUrl = resolveWallpaperUrl(wallpaperUrl, hostUrl);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [bookmarkCategoryId, setBookmarkCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [view, setView] = useState<'home' | 'wallpaper-settings' | 'admin' | 'import-public'>('home');
  const [draggedItem, setDraggedItem] = useState<{ id: string, type: 'Bookmark' | 'Category', categoryId: string, data?: any } | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const refreshUser = async () => {
    setUser({ name: 'Hamster', username: 'hamster', email: 'hamster@local', role: 'Admin' });
    setUserName('Hamster');
    setUserRole('Admin');
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      console.log('[RouteGuard] Checking hash:', hash, 'Role:', userRole, 'Loading:', isUserLoading);
      if (hash === '#/settings/wallpaper') {
        setView('wallpaper-settings');
      } else if (hash === '#/import-public') {
        setView('import-public');
      } else if (hash === '#/admin') {
        if (isUserLoading) {
          console.log('[RouteGuard] User info still loading, skipping check...');
          return;
        }
        
        const isAdmin = userRole?.toLowerCase() === 'admin' || userRole === '1' || userRole === 'Admin';
        
        if (isAdmin) {
          console.log('[RouteGuard] Access granted to Admin');
          setView('admin');
        } else {
          console.warn('[RouteGuard] Access denied. Current role:', userRole);
          alert('Access Denied: Administrators only.');
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          setView('home');
        }
      } else {
        setView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [userRole, isUserLoading]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await storage.get('hamham_token');
      const name = await storage.get('hamham_user_name');
      const sheetId = await storage.get('google_sheet_id');

      if (token && sheetId) {
        setUserName(name || 'Hamster');
        setUser({ name: name || 'Hamster', username: 'hamster', email: 'hamster@local', role: 'Admin' });
        setUserRole('Admin');
        setIsUserLoading(false);
        await loadData();
        refreshSettings();
      } else {
        setIsUserLoading(false);
        setAuthModalOpen(true);
      }
    };
    checkAuth();

    const listener = (message: any) => {
      if (message.type === 'WALLPAPER_ROTATED') {
        // Handle wallpaper rotated
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const loadData = async () => {
    try {
      console.log('[App] Loading categories...');
      await initializeDataFromSheet();
      const cats = await bookmarkApi.getCategories();
      console.log('[App] Categories loaded:', cats);
      setCategories(cats);
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error('Failed to load data', err);
      setAuthModalOpen(true);
    }
  };

  const handleAddCategory = () => {
    setIsCategoryModalOpen(true);
  };

  const openAddBookmark = (catId: string) => {
    setBookmarkCategoryId(catId);
    setIsBookmarkModalOpen(true);
  };

  const handleCategoryAdded = () => {
    loadData();
  };

  const onDragStart = (id: string, type: 'Bookmark' | 'Category', categoryId: string) => {
    setDraggedItem({ id, type, categoryId });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = async (targetId: string) => {
    if (!draggedItem || draggedItem.id === targetId) return;
    
    const categoriesCopy = [...categories];
    const draggedIdx = categoriesCopy.findIndex(c => c.id === draggedItem.id);
    const targetIdx = categoriesCopy.findIndex(c => c.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const [draggedItemObj] = categoriesCopy.splice(draggedIdx, 1);
    categoriesCopy.splice(targetIdx, 0, draggedItemObj);

    setCategories(categoriesCopy);
    setDraggedItem(null);

    try {
      await bookmarkApi.updateCategoryOrder(
        categoriesCopy.map((cat, index) => ({
          categoryId: cat.id,
          sortOrder: index
        }))
      );
    } catch (err) {
      console.error('Failed to update category order', err);
      loadData();
    }
  };

  return (
    <div 
      className={`min-h-screen font-body-standard relative ${view === 'admin' ? 'bg-white' : 'bg-background canvas-bg text-text-primary'}`}
      style={view === 'admin' ? {} : { 
        backgroundImage: resolvedUrl.startsWith('#') ? 'none' : `url(${resolvedUrl})`,
        backgroundColor: resolvedUrl.startsWith('#') ? resolvedUrl : 'transparent',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {view !== 'admin' && (
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ backgroundColor: `rgba(255, 255, 255, ${overlayOpacity})` }}
        />
      )}
      <div className="relative z-10">
         {view === 'home' && <TopNavBar user={user} refreshUser={refreshUser} />}

        <main className={`max-w-[1600px] mx-auto px-6 py-6 ${view === 'admin' ? 'p-0 max-w-none' : ''}`}>
          {view === 'home' ? (
            <>
              <section className="mb-6">
                <h1 className={`font-display-hero text-2xl ${isDarkWallpaper ? 'text-white' : 'text-slate-900'}`}>Hello, {userName || 'Hamster'}!</h1>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                  {categories.filter(c => !c.categoryId && !c.categoriesId).map((category) => (
                                     <div 
                                       key={category.id} 
                                       draggable 
                                       onDragStart={() => onDragStart(category.id, 'Category', category.categoryId || '')} 
                                       onDragOver={onDragOver} 
                                       onDrop={() => onDrop(category.id)}
                                       className="cursor-move"
                                     >
                                     <CategoryCard category={category} onCategoryUpdated={loadData} setEditingCategory={setEditingCategory} setEditingBookmark={setEditingBookmark} refreshTrigger={refreshTrigger} openAddBookmark={openAddBookmark} draggedItem={draggedItem} setDraggedItem={setDraggedItem} />
                                   </div>
                ))}

                <div
                  onClick={handleAddCategory}
                  className="border-2 border-dashed border-[#c5c5d7] p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 group cursor-pointer hover:border-primary/40 hover:bg-white/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline group-hover:text-primary group-hover:bg-primary-fixed transition-colors">
                    <span className="material-symbols-outlined">add</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-text-primary">新增類別</h3>
                  </div>
                </div>
              </div>
            </>
          ) : view === 'wallpaper-settings' ? (
            <WallpaperSettingsPage onBack={() => { window.location.hash = ''; }} />
           ) : view === 'admin' ? (
             <BackendShell 
               primaryAction={{
                 label: '新增使用者',
                 icon: 'person_add',
                 onClick: () => { console.log('Add user clicked'); }
               }}
             />
           ) : view === 'import-public' ? (
             <PublicBookmarkImport />
           ) : null}
        </main>
        {view === 'home' && <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />}
      </div>
      {isCategoryModalOpen && (
        <AddCategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onCategoryAdded={handleCategoryAdded}
        />
      )}
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setAuthModalOpen(false)} 
            onAuthSuccess={() => {
              setAuthModalOpen(false);
              refreshUser();
              loadData();
              refreshSettings();
            }} 
          />
        )}
       {isBookmarkModalOpen && (
         <AddBookmarkModal 
           isOpen={isBookmarkModalOpen} 
           onClose={() => {
             setIsBookmarkModalOpen(false);
             setBookmarkCategoryId(null);
           }} 
           onBookmarkAdded={() => {
             loadData();
             setRefreshTrigger(prev => prev + 1);
           }} 
           categoryId={bookmarkCategoryId || ''} 
         />
       )}
       {editingCategory && (
         <EditCategoryModal 
           isOpen={!!editingCategory} 
           onClose={() => setEditingCategory(null)} 
           onCategoryUpdated={loadData} 
           category={editingCategory} 
         />
       )}
        {editingBookmark && (
          <EditBookmarkModal 
            isOpen={!!editingBookmark} 
            onClose={() => setEditingBookmark(null)} 
            onBookmarkUpdated={() => {
              loadData();
            }} 
            bookmark={editingBookmark} 
          />
        )}
     </div>
  );
};

export default App;
