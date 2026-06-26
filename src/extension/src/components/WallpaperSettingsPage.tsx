import React, { useState, useEffect } from 'react';
import { wallpaperApi } from '../api/wallpaper';
import { WallpaperType } from '../types/wallpaper';
import { useWallpaper } from '../providers/WallpaperProvider';
import { useHostUrl } from '../hooks/useHostUrl';
import { resolveWallpaperUrl } from '../utils/wallpaper';

export const WallpaperSettingsPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { overlayOpacity, setOverlayOpacity, updateWallpaper, setWallpaperUrl, isDarkWallpaper } = useWallpaper();
    const hostUrl = useHostUrl();
    const [wallpaperType, setWallpaperType] = useState<WallpaperType>(WallpaperType.Unsplash);
    const [values, setValues] = useState<Partial<Record<WallpaperType, string>>>({});
    const [isLoading, setIsLoading] = useState(false);

    const wallpaperValue = values[wallpaperType] || '';

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (wallpaperType === WallpaperType.Unsplash) {
            updateWallpaper();
        } else if (wallpaperValue) {
            setWallpaperUrl(wallpaperValue);
        }
    }, [wallpaperType, wallpaperValue, setWallpaperUrl, updateWallpaper]);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const prefs = await wallpaperApi.getPreferences();
            setWallpaperType(prefs.wallpaperType);
            setValues({
                [prefs.wallpaperType]: prefs.wallpaperValue
            });
            if (prefs.overlayOpacity !== undefined) {
                setOverlayOpacity(prefs.overlayOpacity);
            }
        } catch (error) {
            console.error('Failed to load wallpaper settings', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await wallpaperApi.updatePreferences({
                type: wallpaperType,
                value: wallpaperValue,
                source: WallpaperType.Unsplash === wallpaperType ? 'Unsplash' as any : 'Custom' as any,
                keywords: [],
                rotationInterval: 24,
                overlayOpacity: overlayOpacity
            });
            alert('Wallpaper settings saved!');
        } catch (error) {
            alert('Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto overflow-y">
            <div className="flex items-center gap-2 mb-4">
                {onBack && (
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <span className={`material-symbols-outlined ${isDarkWallpaper ? 'text-white' : 'text-slate-500'}`}>arrow_back</span>
                    </button>
                )}
                <h1 className={`text-2xl font-bold ${isDarkWallpaper ? 'text-white' : 'text-slate-900'}`}>桌布設定</h1>
            </div>

            <div className="space-y-3">
                <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800">選擇桌布類型</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {( [
                            { type: WallpaperType.Image, label: '上傳圖片', icon: 'image' },
                            { type: WallpaperType.Color, label: '純色', icon: 'palette' },
                            { type: WallpaperType.Unsplash, label: 'Unsplash', icon: 'auto_awesome' },
                        ] as const).map((option) => (
                            <button
                                key={option.type}
                                onClick={() => setWallpaperType(option.type)}
                                className={`p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center gap-2 ${
                                    wallpaperType === option.type 
                                    ? 'border-primary bg-primary/5 text-primary' 
                                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                }`}
                            >
                                <span className="material-symbols-outlined text-2xl">{option.icon}</span>
                                <span className="text-xs font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {wallpaperType === WallpaperType.Color && (
                    <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800">選擇顏色</h2>
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                 <input 
                                     type="color" 
                                     value={wallpaperValue || '#ffffff'} 
                                     onChange={(e) => {
                                         const color = e.target.value;
                                         setValues(prev => ({ ...prev, [wallpaperType]: color }));
                                     }}
                                     className="w-12 h-12 rounded cursor-pointer"
                                 />
                                 <input 
                                     type="text" 
                                     value={wallpaperValue} 
                                     onChange={(e) => {
                                         const color = e.target.value;
                                         setValues(prev => ({ ...prev, [wallpaperType]: color }));
                                     }}
                                     className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                                     placeholder="#FFFFFF"
                                 />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['#ffffff', '#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'].map(color => (
                                     <button 
                                         key={color} 
                                         onClick={() => {
                                             setValues(prev => ({ ...prev, [wallpaperType]: color }));
                                         }}
                                         className={`w-8 h-8 rounded-full border border-slate-200 transition-transform hover:scale-110 ${wallpaperValue === color ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                         style={{ backgroundColor: color }}
                                     />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {wallpaperType === WallpaperType.Image && (
                    <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800">上傳圖片</h2>
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                            <input 
                                type="file" 
                                accept="image/*" 
                                 onChange={async (e) => {
                                     const file = e.target.files?.[0];
                                     if (!file) return;
                                     
                                      const formData = new FormData();
                                      formData.append('File', file);
                                      const path = await wallpaperApi.upload(formData);
                                      if (path) {
                                          setValues(prev => ({ ...prev, [wallpaperType]: path }));
                                      }
                                 }}
                                className="hidden" 
                                id="wallpaper-upload"
                            />
                            <label htmlFor="wallpaper-upload" className="cursor-pointer">
                                {wallpaperValue ? (
                                    <div className="flex flex-col items-center gap-4">
                                  <img src={resolveWallpaperUrl(wallpaperValue, hostUrl)} alt="Preview" className="w-32 h-32 object-cover rounded-lg shadow-md" />
                                 <span className="text-sm text-primary font-medium">Change image</span>
                                    </div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-4xl text-slate-400 block mb-2">cloud_upload</span>
                                        <span className="text-sm text-slate-600">Click to upload a custom wallpaper</span>
                                    </>
                                )}
                            </label>
                        </div>
                        {wallpaperValue && (
                            <div className="mt-4 p-2 bg-slate-50 rounded-lg text-xs text-slate-500 truncate">
                                Path: {wallpaperValue}
                            </div>
                        )}
                    </section>
                )}

                {wallpaperType === WallpaperType.Unsplash && (
                    <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800">Unsplash Dynamic</h2>
                        <p className="text-sm text-slate-500 mb-4">桌布會每24小時自動更換</p>
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                                <span className="text-sm font-medium text-slate-700">啟用動態更新</span>
                            </div>
                            <button 
                                 onClick={async () => {
                                     setIsLoading(true);
                                     try {
                                         await wallpaperApi.refresh();
                                         await updateWallpaper();
                                         alert('桌布已自動更新');
                                     } catch (e) {
                                         alert('桌布自動更新失敗');
                                     } finally {
                                         setIsLoading(false);
                                     }
                                 }}
                                className="px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
                            >
                                更新
                            </button>
                        </div>
                    </section>
                )}

                <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800">透明度</h2>
                    <div className="flex items-center gap-4">
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05" 
                            value={overlayOpacity} 
                            onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-mono text-slate-600 w-12 text-right">
                            {Math.round(overlayOpacity * 100)}%
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">調整適合的透明度可以得到更好的體驗</p>
                </section>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={async () => {
                            await updateWallpaper();
                            if (onBack) onBack();
                        }}
                        className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isDarkWallpaper 
                            ? 'text-white/70 hover:bg-white/10' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        取消
                    </button>
                     <button 
                         onClick={handleSave}
                         disabled={isLoading}
                         className={`px-6 py-2 text-sm font-medium bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 ${
                             isDarkWallpaper ? 'text-white' : 'text-slate-900'
                         }`}
                     >
                         {isLoading ? 'Saving...' : '存檔'}
                     </button>
                </div>
            </div>
        </div>
    );
};
