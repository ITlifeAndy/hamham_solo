import { storage } from '../services/storage';

export const wallpaperApi = {
  getCurrent: async () => {
    const prefs = await wallpaperApi.getPreferences();
    return prefs.wallpaperValue || '';
  },
  refresh: async () => {
    // 隨機選用一張高品質的自然/景觀桌布
    const collection = [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1472214222541-d510753a8707?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1920&q=80'
    ];
    const randomIndex = Math.floor(Math.random() * collection.length);
    const url = collection[randomIndex];
    
    const prefs = await wallpaperApi.getPreferences();
    prefs.wallpaperValue = url;
    await wallpaperApi.updatePreferences(prefs);
    return url;
  },
  updatePreferences: async (prefs: any) => {
    const transformed = {
      wallpaperType: prefs.wallpaperType || prefs.type,
      wallpaperValue: prefs.wallpaperValue || prefs.value,
      overlayOpacity: prefs.overlayOpacity
    };
    await storage.set('wallpaper_preferences', JSON.stringify(transformed));
  },
  getPreferences: async () => {
    const raw = await storage.get('wallpaper_preferences');
    if (raw) {
      try {
        const prefs = JSON.parse(raw);
        return {
          wallpaperType: prefs.wallpaperType || prefs.type || 'Unsplash',
          wallpaperValue: prefs.wallpaperValue || prefs.value || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
          overlayOpacity: prefs.overlayOpacity !== undefined ? prefs.overlayOpacity : 0.1
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      wallpaperType: 'Unsplash',
      wallpaperValue: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
      overlayOpacity: 0.1
    };
  },
  upload: async (formData: FormData) => {
    const file = (formData.get('File') || formData.get('file')) as File;
    if (file) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    return '';
  }
};
