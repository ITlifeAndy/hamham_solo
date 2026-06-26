export interface AuthResponse {
  token: string;
  refreshToken: string;
  name: string;
}

export type UserRole = 'User' | 'Admin';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  lastSync?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  textColor?: string;
  icon?: string;
  sortOrder: number;
  parentId?: string;
  categoryId?: string;
  categoriesId?: string;
  count?: number;
  usersId?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  faviconUrl?: string;
  isFavorite: boolean;
  categoryId: string;
  icon?: string;
  color?: string;
  textColor?: string;
  sortOrder?: number;
}

export interface SharedPool {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
}

export interface SharedPoolBookmark {
  id: string;
  bookmarkTitle: string;
  bookmarkUrl: string;
}
