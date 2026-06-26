import React, { useState, useEffect } from 'react';
import { sharedApi } from '../api/shared';
import type { SharedPool, SharedPoolBookmark } from '../api/types';

interface SharedPoolBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onPickSuccess: () => void;
}

export const SharedPoolBrowser: React.FC<SharedPoolBrowserProps> = ({ isOpen, onClose, onPickSuccess }) => {
  const [pools, setPools] = useState<SharedPool[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<SharedPoolBookmark[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPools();
    }
  }, [isOpen]);

  const loadPools = async () => {
    setLoading(true);
    try {
      const data = await sharedApi.getPublicPools();
      setPools(data);
    } catch (err) {
      console.error('Failed to load pools', err);
    } finally {
      setLoading(false);
    }
  };

  const selectPool = async (id: string) => {
    setSelectedPoolId(id);
    setLoading(true);
    try {
      const data = await sharedApi.getPoolBookmarks(id);
      setBookmarks(data);
    } catch (err) {
      console.error('Failed to load bookmarks', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-hamham w-full max-w-5xl h-[80vh] shadow-2xl flex overflow-hidden">
        {/* Pools List */}
        <div className="w-1/3 border-r p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Shared Pools</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          {loading && !selectedPoolId ? (
            <div className="text-slate-500">Loading pools...</div>
          ) : (
            <div className="space-y-3">
              {pools.map(pool => (
                <div 
                  key={pool.id}
                  onClick={() => selectPool(pool.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${selectedPoolId === pool.id ? 'bg-hamham-primary text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  <div className="font-bold">{pool.name}</div>
                  <div className="text-xs opacity-70 truncate">{pool.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarks View */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
          {selectedPoolId ? (
            <>
              <h2 className="text-2xl font-bold mb-6">Bookmarks</h2>
              {loading ? (
                <div className="text-slate-500">Loading bookmarks...</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {bookmarks.map(bm => (
                    <div key={bm.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border">
                      <div>
                        <div className="font-medium">{bm.bookmarkTitle}</div>
                        <div className="text-xs text-slate-500 truncate max-w-xs">{bm.bookmarkUrl}</div>
                      </div>
                      <button 
                        onClick={async () => {
                          // Simplified: Pick to a default category or prompt
                          // In a real app, we'd show a category selector
                          try {
                            await sharedApi.pickBookmark(bm.id, 'some-category-id');
                            onPickSuccess();
                            alert('Picked successfully!');
                          } catch (e) {
                            alert('Error picking bookmark');
                          }
                        }}
                        className="px-4 py-2 bg-hamham-primary text-white text-sm font-bold rounded-lg hover:opacity-90"
                      >
                        Pick
                      </button>
                    </div>
                  ))}
                  {bookmarks.length === 0 && <div className="text-slate-500">No bookmarks in this pool.</div>}
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              Select a pool to browse bookmarks
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
