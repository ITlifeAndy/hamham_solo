import React, { useState, useEffect } from 'react';
import { bookmarkApi } from '../api/bookmarks';
import type { Category } from '../api/types';

interface ImportCategorySelectorProps {
  selectedCategoryId: string | null;
  onCategorySelected: (id: string) => void;
}

export const ImportCategorySelector: React.FC<ImportCategorySelectorProps> = ({ 
  selectedCategoryId, 
  onCategorySelected 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const data = await bookmarkApi.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCategories();
  }, []);

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const newCat = await bookmarkApi.createCategory({ name: newCategoryName });
      setCategories(prev => [...prev, newCat]);
      onCategorySelected(newCat.id);
      setNewCategoryName('');
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create category', err);
      alert('創建類別失敗');
    }
  };

  return (
    <div className="relative w-full">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white border border-slate-200 rounded-xl text-sm cursor-pointer hover:border-slate-300 transition-colors flex items-center justify-between"
      >
        <span className={selectedCategory ? 'text-slate-900' : 'text-slate-500'}>
          {selectedCategory ? selectedCategory.name : '請選擇類別...'}
        </span>
        <span className="material-symbols-outlined text-slate-400">expand_more</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input 
                type="text"
                placeholder="搜尋類別..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto">
            {isCreating ? (
              <div className="p-3 flex gap-2">
                <input 
                  type="text"
                  placeholder="輸入類別名稱..."
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  autoFocus
                />
                <button 
                  onClick={handleCreateCategory}
                  className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-colors"
                >
                  儲存
                </button>
                <button 
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  取消
                </button>
              </div>
            ) : isLoading ? (
              <div className="p-4 text-center text-xs text-slate-400">載入中...</div>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map(cat => (
                <div 
                  key={cat.id}
                  onClick={() => {
                    onCategorySelected(cat.id);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 transition-colors ${
                    cat.id === selectedCategoryId ? 'bg-primary/5 text-primary font-medium' : 'text-slate-600'
                  }`}
                >
                  {cat.name}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">找不到符合的類別</div>
            )}
          </div>
          <div className="p-2 border-t border-slate-100">
            <button 
              onClick={() => setIsCreating(true)}
              className="w-full py-2 text-xs text-primary font-semibold hover:bg-primary/5 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              新增類別
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
