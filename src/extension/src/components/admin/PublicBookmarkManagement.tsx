import React, { useState, useEffect } from 'react';
import { publicBookmarkApi, type PublicBookmark, type SharePool } from '../../api/publicBookmarks';
import { AddPoolModal } from './AddPoolModal';
import { EditPoolModal } from './EditPoolModal';
import { AddBookmarkModal } from './AddBookmarkModal';
import { EditBookmarkModal } from './EditBookmarkModal';
import { PoolManagementModal } from './PoolManagementModal';

export const PublicBookmarkManagement: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<PublicBookmark[]>([]);
  const [pools, setPools] = useState<SharePool[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  
  const [isAddPoolOpen, setIsAddPoolOpen] = useState(false);
  const [isEditPoolOpen, setIsEditPoolOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<SharePool | null>(null);
  const [isManagePoolsOpen, setIsManagePoolsOpen] = useState(false);
  
  const [isAddBmOpen, setIsAddBmOpen] = useState(false);
  const [isEditBmOpen, setIsEditBmOpen] = useState(false);
  const [editingBm, setEditingBm] = useState<PublicBookmark | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookmarksData, poolsData] = await Promise.all([
        publicBookmarkApi.getBookmarks(selectedPoolId === 'All' ? undefined : selectedPoolId),
        publicBookmarkApi.getPools()
      ]);
      setBookmarks(bookmarksData);
      setPools(poolsData);
    } catch (err) {
      console.error('Failed to load public bookmarks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPoolId]);

  const handleEditPool = (pool: SharePool) => {
    setEditingPool(pool);
    setIsEditPoolOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <h1 className="text-6xl font-bold text-black">公用書籤管理</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsManagePoolsOpen(true)}
            className="bg-slate-100 text-slate-600 px-6 py-3 rounded-lg font-button-text text-button-text flex items-center gap-2 hover:bg-slate-200 transition-all transform active:scale-95"
          >
            <span className="material-symbols-outlined">settings</span>
            管理類別
          </button>
          <button 
            onClick={() => setIsAddPoolOpen(true)}
            className="bg-slate-100 text-slate-600 px-6 py-3 rounded-lg font-button-text text-button-text flex items-center gap-2 hover:bg-slate-200 transition-all transform active:scale-95"
          >
            <span className="material-symbols-outlined">folder_add</span>
            新增類別
          </button>
          <button 
            onClick={() => setIsAddBmOpen(true)}
            className="bg-[#5b76fe] text-white px-6 py-3 rounded-lg font-button-text text-button-text flex items-center gap-2 shadow-lg shadow-blue-200/50 hover:bg-[#4a63e0] transition-all transform active:scale-95"
          >
            <span className="material-symbols-outlined">bookmark_add</span>
            新增書籤
          </button>
        </div>
      </div>

      {/* Bookmarks Card Container */}
      <div className="bg-white rounded-3xl shadow-[0_0_0_1px_rgba(224,226,232,1)] overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-[#e9eaef] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-sm font-semibold text-slate-500 whitespace-nowrap">篩選類別:</span>
            <select 
              className="px-4 py-2 rounded-lg border border-[#c7cad5] text-sm font-semibold text-slate-600 outline-none hover:bg-slate-50 transition-colors w-full md:w-64"
              value={selectedPoolId}
              onChange={e => setSelectedPoolId(e.target.value)}
            >
              <option value="All">所有類別</option>
              {pools.map(pool => (
                <option key={pool.id} value={pool.id}>{pool.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
               <tr className="bg-surface-container-low border-b border-[#e9eaef]">
                 <th className="px-6 py-4 font-['Epilogue'] text-xs font-bold text-slate-500 uppercase tracking-widest text-center">類別</th>
                 <th className="px-6 py-4 font-['Epilogue'] text-xs font-bold text-slate-500 uppercase tracking-widest text-center">名稱</th>
                 <th className="px-6 py-4 font-['Epilogue'] text-xs font-bold text-slate-500 uppercase tracking-widest text-center">URL</th>
                 <th className="px-6 py-4 font-['Epilogue'] text-xs font-bold text-slate-500 uppercase tracking-widest text-right">操作</th>
               </tr>
             </thead>

            <tbody className="divide-y divide-[#e9eaef]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400">載入中...</td>
                </tr>
              ) : bookmarks.length > 0 ? (
                bookmarks.map(bm => (
                  <tr key={bm.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        {bm.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-body-standard text-sm text-text-primary">{bm.name}</td>
                    <td className="px-6 py-4 font-body-standard text-sm text-text-secondary truncate max-w-xs">{bm.url}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => { setEditingBm(bm); setIsEditBmOpen(true); }}
                          className="material-symbols-outlined p-2 text-slate-400 hover:text-primary transition-colors"
                        >
                          edit
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('確定要刪除此公用書籤嗎？此操作無法撤銷。')) {
                              publicBookmarkApi.deleteBookmark(bm.id).then(loadData).catch(() => alert('刪除失敗'));
                            }
                          }}
                          className="material-symbols-outlined p-2 text-slate-400 hover:text-error transition-colors"
                        >
                          delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400">找不到符合條件的書籤</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PoolManagementModal 
        isOpen={isManagePoolsOpen} 
        onClose={() => setIsManagePoolsOpen(false)} 
        onPoolUpdated={loadData} 
        onEditPool={handleEditPool} 
      />
      <AddPoolModal 
        isOpen={isAddPoolOpen} 
        onClose={() => setIsAddPoolOpen(false)} 
        onPoolAdded={loadData} 
      />
      <EditPoolModal 
        isOpen={isEditPoolOpen} 
        onClose={() => setIsEditPoolOpen(false)} 
        onPoolUpdated={loadData} 
        pool={editingPool} 
      />
      <AddBookmarkModal 
        isOpen={isAddBmOpen} 
        onClose={() => setIsAddBmOpen(false)} 
        onBookmarkAdded={loadData} 
        pools={pools} 
      />
      <EditBookmarkModal 
        isOpen={isEditBmOpen} 
        onClose={() => setIsEditBmOpen(false)} 
        onBookmarkUpdated={loadData} 
        bookmark={editingBm} 
        pools={pools} 
      />
    </div>
  );
};
