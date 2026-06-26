import React, { useState, useEffect } from 'react';
import { type SharePool, publicBookmarkApi } from '../../api/publicBookmarks';

interface PoolManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPoolUpdated: () => void;
  onEditPool: (pool: SharePool) => void;
}

export const PoolManagementModal: React.FC<PoolManagementModalProps> = ({ isOpen, onClose, onPoolUpdated, onEditPool }) => {
  const [pools, setPools] = useState<SharePool[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPools();
    }
  }, [isOpen]);

  const loadPools = async () => {
    setLoading(true);
    try {
      const data = await publicBookmarkApi.getPools();
      setPools(data);
    } catch (err) {
      alert('載入失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('確定要刪除此類別嗎？所有屬於此類別的書籤將被同步刪除。')) {
      try {
        await publicBookmarkApi.deletePool(id);
        loadPools();
        onPoolUpdated();
      } catch (err) {
        alert('刪除失敗');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-[#e9eaef] flex items-center justify-between">
          <h3 className="text-xl font-bold text-black font-['Epilogue']">類別管理</h3>
          <button onClick={onClose} className="material-symbols-outlined text-slate-400 hover:text-black transition-colors">close</button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-center py-10 text-slate-400">載入中...</div>
          ) : pools.length > 0 ? (
            pools.map(pool => (
              <div key={pool.id} className="flex items-center justify-between p-3 rounded-xl border border-[#e9eaef] hover:bg-slate-50 transition-colors">
                <span className="font-semibold text-slate-700">{pool.name}</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => onEditPool(pool)}
                    className="material-symbols-outlined p-1 text-slate-400 hover:text-primary transition-colors"
                  >
                    edit
                  </button>
                  <button 
                    onClick={() => handleDelete(pool.id)}
                    className="material-symbols-outlined p-1 text-slate-400 hover:text-error transition-colors"
                  >
                    delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400">沒有類別</div>
          )}
        </div>
        <div className="p-6 border-t border-[#e9eaef] flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
