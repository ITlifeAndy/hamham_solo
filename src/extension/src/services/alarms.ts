// Mock for environment


export const setupWallpaperAlarm = async () => {
  chrome.alarms.create('rotateWallpaper', { periodInMinutes: 60 });
  
  chrome.alarms.onAlarm.addListener((alarm: chrome.alarms.Alarm) => {
    if (alarm.name === 'rotateWallpaper') {
      console.log('Rotating wallpaper...');
      // fetch from wallpaperApi.refresh() and update UI
    }
  });
};
