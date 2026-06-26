import api from './client';
import type { SharedPool, SharedPoolBookmark } from './types';

export const sharedApi = {
  getPublicPools: async (): Promise<SharedPool[]> => {
    const { data } = await api.get('/shared/pools');
    return data;
  },
  getPoolBookmarks: async (poolId: string): Promise<SharedPoolBookmark[]> => {
    const { data } = await api.get(`/shared/pools/${poolId}/bookmarks`);
    return data;
  },
  pickBookmark: async (poolBookmarkId: string, categoryId: string) => {
    const { data } = await api.post('/shared/pick', { poolBookmarkId, categoryId });
    return data;
  }
};
