import React, { useState, useEffect } from 'react';
import { publicBookmarkApi } from '../../api/publicBookmarks';

interface AddPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPoolAdded: () => void;
}

export const AddPoolModal: React.FC<AddPoolModalProps> = ({ isOpen, onClose, onPoolAdded }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await publicBookmarkApi.createPool(name);
      onPoolAdded();
      onClose();
    } catch (err) {
      alert('創建失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-[#e9eaef] flex items-center justify-between">
          <h3 className="text-xl font-bold text-black font-['Epilogue']">新增類別</h3>
          <button onClick={onClose} className="material-symbols-outlined text-slate-400 hover:text-black transition-colors">close</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1 font-['Epilogue']">類別名稱</label>
            <input 
              className="w-full px-4 py-2 bg-surface-container-low border border-[#e9eaef] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-body-standard text-sm" 
              placeholder="例如: 推薦開發工具" 
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-[#c7cad5] text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#5b76fe] text-white px-6 py-2 rounded-lg font-semibold text-sm shadow-lg shadow-blue-200/50 hover:bg-[#4a63e0] transition-all disabled:opacity-50"
            >
              {loading ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
