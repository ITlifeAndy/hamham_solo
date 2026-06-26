import { wallpaperApi } from './api/wallpaper';

chrome.alarms.create('rotateWallpaper', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener(async (alarm: chrome.alarms.Alarm) => {
  if (alarm.name === 'rotateWallpaper') {
    console.log('Rotating wallpaper via alarm...');
    try {
      const res = await wallpaperApi.refresh();
      chrome.runtime.sendMessage({ type: 'WALLPAPER_ROTATED', url: res });
    } catch (err) {
      console.error('Failed to rotate wallpaper', err);
    }
  }
});
