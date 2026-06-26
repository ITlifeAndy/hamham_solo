import React, { useState, useEffect } from 'react';
import { googleSheetsService } from '../../services/googleSheetsService';
import { authApi } from '../../api/auth';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: () => void;
  user: any;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose, onUserUpdated }) => {
  const [sheetId, setSheetId] = useState('');
  const [hasGoogleToken, setHasGoogleToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      googleSheetsService.getSheetId().then(id => {
        if (id) setSheetId(id);
      });
      googleSheetsService.getAccessToken(false).then(token => {
        setHasGoogleToken(!!token);
      });
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleConnect = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = await googleSheetsService.getAccessToken(true);
      if (token) {
        setHasGoogleToken(true);
        setMessage('Google 帳號連結成功！');
      } else {
        setMessage('Google 帳號連結失敗');
      }
    } catch (err) {
      setMessage('連結時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewSheet = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = await googleSheetsService.getAccessToken(true);
      if (!token) {
        setMessage('請先連結 Google 帳號');
        return;
      }
      const newSheetId = await googleSheetsService.createSheet(token);
      setSheetId(newSheetId);
      setHasGoogleToken(true);
      setMessage('試算表建立成功！');
    } catch (err) {
      setMessage('建立試算表失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm('確定要中斷 Google 帳號的連結嗎？這會清除本地的 Token 與 Sheet ID 設定。')) {
      setLoading(true);
      try {
        await authApi.logout();
        setSheetId('');
        setHasGoogleToken(false);
        setMessage('已中斷連結');
        if (onUserUpdated) onUserUpdated();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (err) {
        setMessage('中斷連結失敗');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await googleSheetsService.setSheetId(sheetId.trim());
      setMessage('設定已成功儲存！');
      if (onUserUpdated) onUserUpdated();
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } catch (err) {
      setMessage('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Google Sheet 設定</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Google 帳號狀態</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGoogleConnect}
                disabled={loading}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                  hasGoogleToken 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {hasGoogleToken ? 'check_circle' : 'link'}
                </span>
                {hasGoogleToken ? '帳號已連結' : '連結 Google 帳號'}
              </button>
              {hasGoogleToken && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="py-2 px-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center justify-center"
                >
                  斷開連結
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">試算表 (Google Sheet)</label>
            <button
              type="button"
              onClick={handleCreateNewSheet}
              disabled={loading}
              className="w-full py-2 px-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-base">add_box</span>
              在雲端硬碟建立新試算表
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Google Sheet ID</label>
            <input 
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none text-sm"
              value={sheetId}
              onChange={e => setSheetId(e.target.value)}
              placeholder="貼上您的 Google Sheet ID"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm font-medium ${message.includes('成功') || message.includes('連結') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">取消</button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '儲存中...' : '儲存變更'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
