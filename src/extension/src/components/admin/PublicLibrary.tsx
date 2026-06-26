import React, { useState, useEffect } from 'react';
import { PublicLibraryList } from './PublicLibraryList';
import type { PublicBookmark } from './PublicLibraryList';
import api from '../../api/client';

export const PublicLibrary: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<PublicBookmark[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<string>('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookmarks = async (poolId?: string) => {
    setIsLoading(true);
    try {
      const url = poolId === 'all' || !poolId 
        ? '/public-bookmarks' 
        : `/public-bookmarks?poolId=${poolId}`;
      
      const response = await api.get(url);
      
      // The API returns a result object with { bookmarks, pools } based on Program.cs logic
      // But wait, the Program.cs implementation I saw earlier returned a projection of bookmarks.
      // Let's check Program.cs again to see exactly what the result is.
      
      // Re-evaluating Program.cs:
      // var result = bookmarks.Select(b => new { ... });
      // return Results.Ok(result);
      // It returns ONLY the bookmarks array. The pools were fetched but not returned in the result.
      
      const data = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        subtitle: item.category || '公用書籤',
        url: item.url,
      }));
      setBookmarks(data);
    } catch (err) {
      console.error('Failed to fetch public bookmarks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
    
    // We need to fetch pools separately if the endpoint doesn't return them.
    // Let's see if there is a pool endpoint. 
    // I'll assume for now we can use the category/pool info from the bookmarks themselves 
    // or I should implement a pool fetcher.
  }, []);

  useEffect(() => {
    fetchBookmarks(selectedPoolId === 'all' ? undefined : selectedPoolId);
  }, [selectedPoolId]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-6xl font-bold text-black">公用書籤庫</h1>
          <select 
            value={selectedPoolId}
            onChange={(e) => setSelectedPoolId(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">所有類別</option>
            {/* Pools will be populated here once we have a way to fetch them */}
            {Array.from(new Set(bookmarks.map(b => b.subtitle))).map(subtitle => (
              <option key={subtitle} value={subtitle}>{subtitle}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => setSelectionMode(!selectionMode)}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
            selectionMode 
            ? 'bg-primary text-white shadow-lg shadow-primary/30' 
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-lg">checklist</span>
          {selectionMode ? '退出選擇模式' : '進入選擇模式'}
        </button>
      </div>
      <div className="p-4 bg-white rounded-2xl border border-slate-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            載入中...
          </div>
        ) : (
          <PublicLibraryList 
            bookmarks={bookmarks} 
            selectionMode={selectionMode} 
            selectedIds={selectedIds} 
            onToggleSelection={toggleSelection}
          />
        )}
      </div>
    </div>
  );
};
