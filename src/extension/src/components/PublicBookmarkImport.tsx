import React, { useState, useEffect } from 'react';
import { PublicLibraryList } from './admin/PublicLibraryList';
import type { PublicBookmark } from './admin/PublicLibraryList';
import { ImportCategorySelector } from './ImportCategorySelector';
import api from '../api/client';

interface ImportSettings {
  categoryId: string | null;
  color: string;
  glass: boolean;
}

export const PublicBookmarkImport: React.FC = () => {
  const [publicBookmarks, setPublicBookmarks] = useState<PublicBookmark[]>([]);
  const [pools, setPools] = useState<{ id: string; name: string }[]>([]);
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<string>('all');
  const [settings, setSettings] = useState<ImportSettings>({
    categoryId: null,
    color: '#3b82f6',
    glass: false,
  });
  
  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await api.get('/shared/pools');
        setPools(response.data.map((p: any) => ({ id: p.id, name: p.name })));
      } catch (err) {
        console.error('Failed to fetch pools', err);
      }
    };

    fetchPools();
  }, []);

  useEffect(() => {
    const fetchPublicBookmarks = async () => {
      setIsLoading(true);
      try {
        const url = selectedPool === 'all' ? '/public-bookmarks' : `/public-bookmarks?poolId=${selectedPool}`;
        const response = await api.get(url);
        const data = response.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          subtitle: item.category || '公用書籤',
          url: item.url,
        }));
        setPublicBookmarks(data);
      } catch (err) {
        console.error('Failed to fetch public bookmarks', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicBookmarks();
  }, [selectedPool]);

  const toggleSelection = (id: string) => {
    setSelectedBookmarks(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleImport = async () => {
    setIsImporting(true);
      try {
        const response = await api.post('/bookmarks/import-public', {
          publicBookmarkIds: selectedBookmarks,
        targetCategoryId: settings.categoryId,
        color: settings.color,
        glass: settings.glass,
      });

      if (response.status === 200) {
        alert(`成功導入 ${selectedBookmarks.length} 個書籤！`);
        window.location.hash = ''; // Return home
      }
    } catch (err: any) {
      console.error('Import failed', err);
      alert(`導入失敗: ${err.response?.data?.message || '未知錯誤'}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white font-['Epilogue'] antialiased">
      {/* Left Side: Browser */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-900">選擇公用書籤</h1>
            <select 
              value={selectedPool}
              onChange={(e) => setSelectedPool(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">所有類別</option>
              {pools.map(pool => (
                <option key={pool.id} value={pool.id}>{pool.name}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-slate-500">
            已選擇 <span className="font-bold text-primary">{selectedBookmarks.length}</span> 個書籤
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            載入中...
          </div>
        ) : (
          <PublicLibraryList 
            bookmarks={publicBookmarks} 
            selectionMode={true} 
            selectedIds={selectedBookmarks} 
            onToggleSelection={toggleSelection}
          />
        )}
      </div>

      {/* Right Side: Config Panel */}
      <div className="w-96 border-l border-slate-100 bg-slate-50 p-8 overflow-y-auto flex flex-col">
        <h2 className="text-xl font-bold text-slate-900 mb-6">導入設定</h2>
        
        <div className="space-y-6 flex-1">
          {/* Target Category Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">選擇導入類別</label>
            <ImportCategorySelector 
              selectedCategoryId={settings.categoryId} 
              onCategorySelected={(id) => setSettings(prev => ({ ...prev, categoryId: id }))} 
            />
          </div>

          {/* Visual Preferences Section */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <label className="text-sm font-semibold text-slate-700 block">視覺設定</label>
            <div className="grid grid-cols-5 gap-2">
              {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#6366f1'].map(color => (
                <div 
                  key={color} 
                  onClick={() => setSettings(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-all duration-200 hover:scale-110 ${
                    settings.color === color ? 'border-slate-900 scale-110' : 'border-white shadow-sm'
                  }`} 
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div 
              onClick={() => setSettings(prev => ({ ...prev, glass: !prev.glass }))}
              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-colors"
            >
              <span className="text-sm text-slate-600">玻璃效果</span>
              <div className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${
                settings.glass ? 'bg-primary' : 'bg-slate-200'
              }`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200 ${
                  settings.glass ? 'left-6' : 'left-1'
                }`}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => { window.location.hash = ''; }}
            className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-all duration-200 active:scale-95"
          >
            取消
          </button>
          <button 
            disabled={selectedBookmarks.length === 0 || !settings.categoryId || isImporting}
            onClick={handleImport}
            className={`flex-[2] py-3 rounded-xl font-bold transition-all duration-200 ${
              selectedBookmarks.length > 0 && settings.categoryId && !isImporting
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95' 
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isImporting ? '導入中...' : `導入 ${selectedBookmarks.length} 個書籤`}
          </button>
        </div>

      </div>
    </div>
  );
};
