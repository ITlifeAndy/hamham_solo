import React, { useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { googleSheetsService } from '../services/googleSheetsService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [sheetId, setSheetId] = useState('');
  const [hasGoogleToken, setHasGoogleToken] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      googleSheetsService.getSheetId().then(id => {
        if (id) setSheetId(id);
      });
      googleSheetsService.getAccessToken(false).then(token => {
        setHasGoogleToken(!!token);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleConnect = async () => {
    setLoading(true);
    try {
      const token = await googleSheetsService.getAccessToken(true);
      if (token) {
        setHasGoogleToken(true);
        alert('Google 帳號連結成功！');
      } else {
        alert('Google 帳號連結失敗，請重試。');
      }
    } catch (err) {
      alert('連結 Google 帳號時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewSheet = async () => {
    setLoading(true);
    try {
      const token = await googleSheetsService.getAccessToken(true);
      if (!token) {
        alert('請先點選「連結 Google 帳號」進行授權。');
        return;
      }
      
      const newSheetId = await googleSheetsService.createSheet(token);
      setSheetId(newSheetId);
      setHasGoogleToken(true);
      alert('成功在您的 Google 雲端硬碟建立試算表！\n檔名: HamHam-Bookmarks-Solo');
    } catch (err) {
      console.error(err);
      alert('建立試算表失敗，請確認是否已授權寫入權限。');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasGoogleToken) {
      alert('請先連結 Google 帳號');
      return;
    }

    if (!sheetId.trim()) {
      alert('請填寫 Google Sheet ID 或點選自動建立');
      return;
    }

    setLoading(true);
    try {
      await googleSheetsService.setSheetId(sheetId.trim());
      await authApi.login('hamster', 'password');
      onAuthSuccess();
      onClose();
    } catch (err) {
      alert('設定失敗，請檢查設定與權限');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-hamham p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-6">
          <img src="/logob.png" alt="HamHam Logo" className="w-20 h-20 object-contain" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center text-slate-800">
          HamHam - 單人自用設定
        </h2>
        <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
          此版本為單人自用版，所有書籤資料將安全的存放在您個人的 Google 試算表中，無須任何 HamHam 伺服器。
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              步驟 1：連結 Google 帳號
            </label>
            <button
              type="button"
              onClick={handleGoogleConnect}
              disabled={loading}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                hasGoogleToken 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {hasGoogleToken ? 'check_circle' : 'link'}
              </span>
              {hasGoogleToken ? 'Google 帳號已連結' : '連結 Google 帳號'}
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              步驟 2：選擇或建立試算表
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateNewSheet}
                disabled={loading}
                className="flex-1 py-2 px-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-base">add_box</span>
                自動建立試算表
              </button>
            </div>

            <div className="mt-2">
              <input
                type="text"
                placeholder="手動貼上現有的 Google Sheet ID"
                className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
                value={sheetId}
                onChange={e => setSheetId(e.target.value)}
                disabled={loading}
              />
              <span className="text-[10px] text-slate-400 block mt-1 px-1">
                ※ 試算表 ID 為網址列中 /d/ 後方的一長串字串
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? '處理中...' : '開始使用'}
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </form>
      </div>
    </div>
  );
};
