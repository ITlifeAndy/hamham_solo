import { googleSheetsService } from '../services/googleSheetsService';
import { initializePublicBookmarksFromSheet } from './publicBookmarks';
import type { Category, Bookmark } from './types';

let cachedCategories: Category[] = [];
let cachedBookmarks: Bookmark[] = [];

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const syncCategoriesToSheet = async () => {
  try {
    await googleSheetsService.saveSheetData(
      'Categories!A2:G',
      ["id", "name", "color", "textColor", "icon", "sortOrder", "parentId"],
      cachedCategories
    );
  } catch (err) {
    console.error('[GoogleSheets] Failed to sync categories', err);
  }
};

const syncBookmarksToSheet = async () => {
  try {
    await googleSheetsService.saveSheetData(
      'Bookmarks!A2:K',
      ["id", "title", "subtitle", "url", "faviconUrl", "isFavorite", "categoryId", "icon", "color", "textColor", "sortOrder"],
      cachedBookmarks
    );
  } catch (err) {
    console.error('[GoogleSheets] Failed to sync bookmarks', err);
  }
};

export const initializeDataFromSheet = async () => {
  try {
    const data = await googleSheetsService.loadAllData();
    cachedCategories = data.categories || [];
    cachedBookmarks = data.bookmarks || [];
    initializePublicBookmarksFromSheet(data);
    console.log('[GoogleSheets] Data loaded from sheet', cachedCategories, cachedBookmarks);
  } catch (err) {
    console.error('[GoogleSheets] Failed to load data from sheet', err);
    throw err;
  }
};

export const bookmarkApi = {
  getCategories: async (): Promise<Category[]> => {
    return [...cachedCategories].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  createCategory: async (category: Partial<Category>) => {
    const newCat: Category = {
      id: generateUUID(),
      name: category.name || '未命名分類',
      color: category.color || '#E2E8F0',
      textColor: category.textColor || '#1E293B',
      icon: category.icon || 'folder',
      sortOrder: category.sortOrder !== undefined ? category.sortOrder : cachedCategories.length,
      parentId: category.parentId || undefined,
      categoryId: category.categoryId || undefined,
      categoriesId: category.categoriesId || undefined,
    };
    cachedCategories.push(newCat);
    await syncCategoriesToSheet();
    return newCat;
  },

  updateCategory: async (id: string, category: Partial<Category>) => {
    const index = cachedCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      cachedCategories[index] = {
        ...cachedCategories[index],
        ...category
      };
      await syncCategoriesToSheet();
      return cachedCategories[index];
    }
    throw new Error('Category not found');
  },

  updateCategoryOrder: async (orders: { categoryId: string, sortOrder: number }[]) => {
    orders.forEach(order => {
      const cat = cachedCategories.find(c => c.id === order.categoryId);
      if (cat) {
        cat.sortOrder = order.sortOrder;
      }
    });
    await syncCategoriesToSheet();
  },

  updateUnifiedOrder: async (categoryId: string, orders: { itemId: string, type: 'Bookmark' | 'Category', sortOrder: number }[]) => {
    let changedCat = false;
    let changedBm = false;

    orders.forEach(order => {
      if (order.type === 'Category') {
        const cat = cachedCategories.find(c => c.id === order.itemId);
        if (cat) {
          cat.sortOrder = order.sortOrder;
          cat.parentId = categoryId || undefined;
          cat.categoryId = categoryId || undefined;
          cat.categoriesId = categoryId || undefined;
          changedCat = true;
        }
      } else {
        const bm = cachedBookmarks.find(b => b.id === order.itemId);
        if (bm) {
          bm.sortOrder = order.sortOrder;
          bm.categoryId = categoryId;
          changedBm = true;
        }
      }
    });

    if (changedCat) await syncCategoriesToSheet();
    if (changedBm) await syncBookmarksToSheet();
  },

  getUnifiedItems: async (categoryId: string) => {
    const subCategories = cachedCategories
      .filter(c => c.parentId === categoryId || c.categoryId === categoryId || c.categoriesId === categoryId)
      .map(c => ({
        itemId: c.id,
        type: 'Category' as const,
        sortOrder: c.sortOrder,
        data: c
      }));

    const subBookmarks = cachedBookmarks
      .filter(b => b.categoryId === categoryId)
      .map(b => ({
        itemId: b.id,
        type: 'Bookmark' as const,
        sortOrder: b.sortOrder !== undefined ? b.sortOrder : 9999,
        data: b
      }));

    const merged = [...subCategories, ...subBookmarks].sort((a, b) => {
      return a.sortOrder - b.sortOrder;
    });

    return merged;
  },

  deleteCategory: async (id: string) => {
    cachedCategories = cachedCategories.filter(c => c.id !== id);
    cachedBookmarks = cachedBookmarks.filter(b => b.categoryId !== id);
    
    await syncCategoriesToSheet();
    await syncBookmarksToSheet();
  },

  updateBookmark: async (id: string, bookmark: Partial<Bookmark>) => {
    const index = cachedBookmarks.findIndex(b => b.id === id);
    if (index !== -1) {
      cachedBookmarks[index] = {
        ...cachedBookmarks[index],
        ...bookmark
      };
      await syncBookmarksToSheet();
      return cachedBookmarks[index];
    }
    throw new Error('Bookmark not found');
  },

  updateBookmarkOrder: async (bookmarkIds: string[]) => {
    bookmarkIds.forEach((id, index) => {
      const bm = cachedBookmarks.find(b => b.id === id);
      if (bm) {
        bm.sortOrder = index;
      }
    });
    await syncBookmarksToSheet();
  },

  getBookmarks: async (categoryId?: string): Promise<Bookmark[]> => {
    let result = categoryId 
      ? cachedBookmarks.filter(b => b.categoryId === categoryId)
      : cachedBookmarks;
    return [...result].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  createBookmark: async (bookmark: Partial<Bookmark>) => {
    const newBm: Bookmark = {
      id: generateUUID(),
      title: bookmark.title || '未命名書籤',
      subtitle: bookmark.subtitle || '',
      url: bookmark.url || '',
      faviconUrl: bookmark.faviconUrl || '',
      isFavorite: bookmark.isFavorite || false,
      categoryId: bookmark.categoryId || '',
      icon: bookmark.icon || '',
      color: bookmark.color || '',
      textColor: bookmark.textColor || '',
      sortOrder: bookmark.sortOrder !== undefined ? bookmark.sortOrder : cachedBookmarks.length
    };
    cachedBookmarks.push(newBm);
    await syncBookmarksToSheet();
    return newBm;
  },

  deleteBookmark: async (id: string) => {
    cachedBookmarks = cachedBookmarks.filter(b => b.id !== id);
    await syncBookmarksToSheet();
  },

  importBookmarks: async (bookmarks: any[]) => {
    bookmarks.forEach(bm => {
      const newBm: Bookmark = {
        id: bm.id || generateUUID(),
        title: bm.title || '未命名書籤',
        subtitle: bm.subtitle || '',
        url: bm.url || '',
        faviconUrl: bm.faviconUrl || '',
        isFavorite: bm.isFavorite || false,
        categoryId: bm.categoryId || '',
        icon: bm.icon || '',
        color: bm.color || '',
        textColor: bm.textColor || '',
        sortOrder: bm.sortOrder !== undefined ? bm.sortOrder : cachedBookmarks.length
      };
      cachedBookmarks.push(newBm);
    });
    await syncBookmarksToSheet();
    return { success: true, count: bookmarks.length };
  }
};
