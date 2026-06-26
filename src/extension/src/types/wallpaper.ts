export const WallpaperType = {
    Image: 'Image',
    Color: 'Color',
    Unsplash: 'Unsplash',
} as const;


export type WallpaperType = typeof WallpaperType[keyof typeof WallpaperType];
