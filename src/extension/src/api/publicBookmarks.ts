import { googleSheetsService } from '../services/googleSheetsService';

export interface PublicBookmark {
  id: string;
  name: string;
  url: string;
  category: string;
}

export interface SharePool {
  id: string;
  name: string;
}

let cachedSharePools: SharePool[] = [];
let cachedSharePoolBookmarks: PublicBookmark[] = [];

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const syncSharePoolsToSheet = async () => {
  try {
    await googleSheetsService.saveSheetData('SharePools!A2:B', ["id", "name"], cachedSharePools);
  } catch (err) {
    console.error('[GoogleSheets] Failed to sync share pools', err);
  }
};

const syncSharePoolBookmarksToSheet = async () => {
  try {
    await googleSheetsService.saveSheetData('SharePoolBookmarks!A2:D', ["id", "name", "url", "category"], cachedSharePoolBookmarks);
  } catch (err) {
    console.error('[GoogleSheets] Failed to sync share pool bookmarks', err);
  }
};

export const initializePublicBookmarksFromSheet = (data: any) => {
  cachedSharePools = data.sharePools || [];
  cachedSharePoolBookmarks = data.sharePoolBookmarks || [];
};

export const publicBookmarkApi = {
  async getBookmarks(poolId?: string) {
    if (poolId) {
      return cachedSharePoolBookmarks.filter(b => b.category === poolId);
    }
    return cachedSharePoolBookmarks;
  },
  async getPools() {
    return cachedSharePools;
  },
  async createPool(name: string) {
    const newPool: SharePool = {
      id: generateUUID(),
      name
    };
    cachedSharePools.push(newPool);
    await syncSharePoolsToSheet();
    return newPool;
  },
  async updatePool(id: string, name: string) {
    const pool = cachedSharePools.find(p => p.id === id);
    if (pool) {
      pool.name = name;
      await syncSharePoolsToSheet();
      return pool;
    }
    throw new Error('Pool not found');
  },
  async deletePool(id: string) {
    cachedSharePools = cachedSharePools.filter(p => p.id !== id);
    cachedSharePoolBookmarks = cachedSharePoolBookmarks.filter(b => b.category !== id);
    await syncSharePoolsToSheet();
    await syncSharePoolBookmarksToSheet();
  },
  async createBookmark(poolId: string, name: string, url: string) {
    const newBookmark: PublicBookmark = {
      id: generateUUID(),
      name,
      url,
      category: poolId
    };
    cachedSharePoolBookmarks.push(newBookmark);
    await syncSharePoolBookmarksToSheet();
    return newBookmark;
  },
  async updateBookmark(id: string, name: string, url: string) {
    const bm = cachedSharePoolBookmarks.find(b => b.id === id);
    if (bm) {
      bm.name = name;
      bm.url = url;
      await syncSharePoolBookmarksToSheet();
      return bm;
    }
    throw new Error('Public bookmark not found');
  },
  async deleteBookmark(id: string) {
    cachedSharePoolBookmarks = cachedSharePoolBookmarks.filter(b => b.id !== id);
    await syncSharePoolBookmarksToSheet();
  }
};
