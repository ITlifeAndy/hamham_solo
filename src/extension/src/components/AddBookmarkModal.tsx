import React, { useState } from 'react';
import { bookmarkApi } from '../api/bookmarks';
import { HexColorPicker } from 'react-colorful';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookmarkAdded: () => void;
  categoryId: string;
}

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({ isOpen, onClose, onBookmarkAdded, categoryId }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [url, setUrl] = useState('');
  const [color, setColor] = useState('#dee1ff');
  const [textColor, setTextColor] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setError('名稱與 URL 為必填');
      return;
    }

    setLoading(true);
    setError('');
      try {
           await bookmarkApi.createBookmark({
             title,
             subtitle,
             url,
             categoryId,
             color,
             textColor,
             isFavorite: false,
           } as any);
        onBookmarkAdded();
        onClose();
        setTitle('');
        setSubtitle('');
         setUrl('');
         setColor('#dee1ff');
         setTextColor('');
      } catch (err) {
      setError('建立書籤失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-900">新增書籤</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">名稱 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="書籤名稱..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">URL *</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">顏色 / 效果</label>
                  <div className="flex flex-col gap-3 items-center">
                    <div className="flex gap-3 w-full justify-center mb-2">
                      <button 
                        type="button"
                        onClick={() => setColor('#dee1ff')}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${color === '#dee1ff' ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        預設色
                      </button>
                      <button 
                        type="button"
                        onClick={() => setColor('glass')}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${color === 'glass' ? 'bg-blue-400 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        ✨ 玻璃效果
                      </button>
                    </div>
                     {color !== 'glass' ? (
                       <>
                         <div className="border rounded-xl p-2 bg-slate-50">
                           <HexColorPicker color={color} onChange={setColor} />
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color }} />
                           <input 
                             type="text" 
                             value={color} 
                             onChange={(e) => setColor(e.target.value)} 
                             className="text-[10px] w-20 px-2 py-1 rounded border border-slate-200 outline-none"
                           />
                         </div>
                       </>
                     ) : (
                       <div className="w-full p-4 rounded-xl border border-blue-100 bg-blue-50/50 text-center">
                         <p className="text-[10px] text-blue-600 italic">已啟用玻璃擬態效果</p>
                       </div>
                     )}
                   </div>
                   <div className="mt-4">
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">文字顏色 (可選)</label>
                     <div className="flex flex-col gap-3 items-center">
                       {textColor ? (
                         <>
                           <div className="border rounded-xl p-2 bg-slate-50">
                             <HexColorPicker color={textColor} onChange={setTextColor} />
                           </div>
                           <div className="flex items-center gap-2">
                             <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: textColor }} />
                             <input 
                               type="text" 
                               value={textColor} 
                               onChange={(e) => setTextColor(e.target.value)} 
                               className="text-[10px] w-20 px-2 py-1 rounded border border-slate-200 outline-none"
                             />
                             <button 
                               type="button"
                               onClick={() => setTextColor('')}
                               className="text-[10px] text-slate-400 hover:text-red-500 transition-colors"
                             >
                               清除
                             </button>
                           </div>
                         </>
                       ) : (
                         <div className="w-full p-4 rounded-xl border border-slate-200 bg-white text-center">
                           <button 
                             type="button"
                             onClick={() => setTextColor('#000000')}
                             className="text-xs text-slate-500 hover:text-primary transition-colors"
                           >
                             設定文字顏色 $\rightarrow$
                           </button>
                         </div>
                       )}
                     </div>
                   </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col h-full">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">備註</label>
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="在此輸入詳細備註..."
                className="flex-1 w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none min-h-[200px]"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs text-center mt-6">{error}</p>}
          <div className="flex gap-3 pt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all active:scale-95"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-xl bg-[#2f4dd5] text-white font-semibold hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? '建立中...' : '建立書籤'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
