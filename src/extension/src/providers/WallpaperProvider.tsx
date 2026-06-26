import React, { createContext, useContext, useState, useEffect } from 'react';
import { wallpaperApi } from '../api/wallpaper';
import { calculateImageBrightness } from '../utils/wallpaper';
import { storage } from '../services/storage';

interface WallpaperContextType {
    wallpaperUrl: string;
    overlayOpacity: number;
    setOverlayOpacity: (opacity: number) => void;
    setWallpaperUrl: (url: string) => void;
    updateWallpaper: () => Promise<void>;
    refreshSettings: () => Promise<void>;
    isDarkWallpaper: boolean;
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

export const WallpaperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wallpaperUrl, setWallpaperUrl] = useState<string>('#f4f2fe'); // Default to a neutral light color instead of a hardcoded Unsplash image
    const [overlayOpacity, setOverlayOpacity] = useState(0.4);
    const [isDarkWallpaper, setIsDarkWallpaper] = useState(false);

    const updateBrightness = async (url: string) => {
        const brightness = await calculateImageBrightness(url);
        setIsDarkWallpaper(brightness === 'dark');
    };

    const loadWallpaper = async () => {
        try {
            const url = await wallpaperApi.getCurrent();
            setWallpaperUrl(url);
            await updateBrightness(url);
        } catch (error) {
            console.error('Failed to load wallpaper', error);
        }
    };
    
    const loadOpacity = async () => {
        try {
            const prefs = await wallpaperApi.getPreferences();
            if (prefs.overlayOpacity !== undefined) {
                setOverlayOpacity(prefs.overlayOpacity);
            }
        } catch (error) {
            console.error('Failed to load opacity', error);
        }
    };

    const refreshSettings = async () => {
        await loadWallpaper();
        await loadOpacity();
    };

    useEffect(() => {
        const init = async () => {
            const token = await storage.get('hamham_token');
            if (token) {
                await refreshSettings();
            }
        };
        init();
    }, []);

    useEffect(() => {
        updateBrightness(wallpaperUrl);
    }, [wallpaperUrl]);

    const updateWallpaper = async () => {
        try {
            const url = await wallpaperApi.getCurrent();
            setWallpaperUrl(url);
            await updateBrightness(url);
        } catch (error) {
            console.error('Failed to update wallpaper', error);
        }
    };

    return (
        <WallpaperContext.Provider value={{ wallpaperUrl, overlayOpacity, setOverlayOpacity, setWallpaperUrl, updateWallpaper, refreshSettings, isDarkWallpaper }}>
            {children}
        </WallpaperContext.Provider>
    );

};

export const useWallpaper = () => {
    const context = useContext(WallpaperContext);
    if (!context) throw new Error('useWallpaper must be used within a WallpaperProvider');
    return context;
};
