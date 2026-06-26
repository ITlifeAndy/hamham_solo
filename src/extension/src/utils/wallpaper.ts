export const resolveWallpaperUrl = (url: string | undefined | null, host: string = 'http://localhost:5000') => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('#')) return url;
  if (url.startsWith('/uploads')) return `${host}${url}`;
  return url;
};

export const calculateImageBrightness = async (value: string): Promise<'light' | 'dark'> => {
  try {
    if (value.startsWith('#') && (value.length === 4 || value.length === 7)) {
      let r, g, b;
      if (value.length === 4) {
        r = parseInt(value[1] + value[1], 16);
        g = parseInt(value[2] + value[2], 16);
        b = parseInt(value[3] + value[3], 16);
      } else {
        r = parseInt(value.substring(1, 3), 16);
        g = parseInt(value.substring(3, 5), 16);
        b = parseInt(value.substring(5, 7), 16);
      }
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
      return brightness > 128 ? 'light' : 'dark';
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = value;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('light');

        // Use a smaller canvas to get an average color
        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(img, 0, 0, 10, 10);
        const imageData = ctx.getImageData(0, 0, 10, 10).data;
        
        let totalR = 0, totalG = 0, totalB = 0;
        for (let i = 0; i < imageData.length; i += 4) {
          totalR += imageData[i];
          totalG += imageData[i + 1];
          totalB += imageData[i + 2];
        }
        
        const avgR = totalR / (imageData.length / 4);
        const avgG = totalG / (imageData.length / 4);
        const avgB = totalB / (imageData.length / 4);
        
        const brightness = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB);
        resolve(brightness > 128 ? 'light' : 'dark');
      };
      img.onerror = () => resolve('light');
    });
  } catch {
    return 'light';
  }
};
