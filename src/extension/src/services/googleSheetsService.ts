import axios from 'axios';
import { storage } from './storage';
import { GOOGLE_CLIENT_ID } from '../config';

const TOKEN_KEY = 'google_access_token';
const EXPIRY_KEY = 'google_token_expiry';
const SHEET_ID_KEY = 'google_sheet_id';

export const googleSheetsService = {
  async getAccessToken(interactive = false): Promise<string | null> {
    const token = await storage.get(TOKEN_KEY);
    const expiryStr = await storage.get(EXPIRY_KEY);
    const now = Date.now();

    if (token && expiryStr && parseInt(expiryStr, 10) > now + 60000) {
      return token;
    }

    if (typeof chrome === 'undefined' || !chrome.identity) {
      console.warn('Chrome identity API not available');
      return null;
    }

    try {
      const redirectUri = chrome.identity.getRedirectURL();
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file')}`;

      return new Promise((resolve) => {
        chrome.identity.launchWebAuthFlow(
          { url: authUrl, interactive },
          async (redirectUrl) => {
            if (chrome.runtime.lastError || !redirectUrl) {
              console.warn('launchWebAuthFlow failed or cancelled', chrome.runtime.lastError);
              resolve(null);
              return;
            }

            const url = new URL(redirectUrl);
            const params = new URLSearchParams(url.hash.substring(1));
            const accessToken = params.get('access_token');
            const expiresIn = params.get('expires_in');

            if (accessToken) {
              await storage.set(TOKEN_KEY, accessToken);
              const expiryTime = Date.now() + (parseInt(expiresIn || '3600', 10) * 1000);
              await storage.set(EXPIRY_KEY, expiryTime.toString());
              resolve(accessToken);
            } else {
              resolve(null);
            }
          }
        );
      });
    } catch (err) {
      console.error('Failed to launch web auth flow', err);
      return null;
    }
  },

  async disconnect(): Promise<void> {
    await storage.remove(TOKEN_KEY);
    await storage.remove(EXPIRY_KEY);
    await storage.remove(SHEET_ID_KEY);
  },

  async getSheetId(): Promise<string | null> {
    return await storage.get(SHEET_ID_KEY);
  },

  async setSheetId(sheetId: string): Promise<void> {
    await storage.set(SHEET_ID_KEY, sheetId);
  },

  async createSheet(token: string): Promise<string> {
    const res = await axios.post(
      'https://sheets.googleapis.com/v4/spreadsheets',
      {
        properties: {
          title: 'HamHam-Bookmarks-Solo'
        },
        sheets: [
          { properties: { title: 'Categories' } },
          { properties: { title: 'Bookmarks' } },
          { properties: { title: 'SharePools' } },
          { properties: { title: 'SharePoolBookmarks' } }
        ]
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const spreadsheetId = res.data.spreadsheetId;

    await axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: 'Categories!A1:G1',
            values: [["id", "name", "color", "textColor", "icon", "sortOrder", "parentId"]]
          },
          {
            range: 'Bookmarks!A1:K1',
            values: [["id", "title", "subtitle", "url", "faviconUrl", "isFavorite", "categoryId", "icon", "color", "textColor", "sortOrder"]]
          },
          {
            range: 'SharePools!A1:B1',
            values: [["id", "name"]]
          },
          {
            range: 'SharePoolBookmarks!A1:D1',
            values: [["id", "name", "url", "category"]]
          }
        ]
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    await this.setSheetId(spreadsheetId);
    return spreadsheetId;
  },

  async loadAllData(): Promise<{
    categories: any[];
    bookmarks: any[];
    sharePools: any[];
    sharePoolBookmarks: any[];
  }> {
    const token = await this.getAccessToken(true);
    const sheetId = await this.getSheetId();
    if (!token || !sheetId) {
      throw new Error('Google OAuth or Sheet ID not set');
    }

    try {
      const res = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?ranges=Categories!A2:G&ranges=Bookmarks!A2:K&ranges=SharePools!A2:B&ranges=SharePoolBookmarks!A2:D`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const valueRanges = res.data.valueRanges || [];

      const parseRows = (rows: any[] | undefined, headers: string[]) => {
        if (!rows) return [];
        return rows.map(row => {
          const obj: any = {};
          headers.forEach((header, index) => {
            let val = row[index] !== undefined ? row[index] : '';
            if (val === 'true') val = true;
            if (val === 'false') val = false;
            if (header === 'sortOrder') {
              const num = parseInt(val, 10);
              val = isNaN(num) ? 0 : num;
            }
            obj[header] = val;
          });
          return obj;
        });
      };

      const categories = parseRows(valueRanges[0]?.values, ["id", "name", "color", "textColor", "icon", "sortOrder", "parentId"]);
      const bookmarks = parseRows(valueRanges[1]?.values, ["id", "title", "subtitle", "url", "faviconUrl", "isFavorite", "categoryId", "icon", "color", "textColor", "sortOrder"]);
      const sharePools = parseRows(valueRanges[2]?.values, ["id", "name"]);
      const sharePoolBookmarks = parseRows(valueRanges[3]?.values, ["id", "name", "url", "category"]);

      return { categories, bookmarks, sharePools, sharePoolBookmarks };
    } catch (err) {
      console.error('Failed to load Google Sheets data', err);
      throw err;
    }
  },

  async saveSheetData(range: string, headers: string[], items: any[]): Promise<void> {
    const token = await this.getAccessToken(true);
    const sheetId = await this.getSheetId();
    if (!token || !sheetId) {
      throw new Error('Google OAuth or Sheet ID not set');
    }

    await axios.post(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:clear`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (items.length === 0) return;

    const rows = items.map(item => {
      return headers.map(header => {
        const val = item[header];
        if (val === undefined || val === null) return '';
        return String(val);
      });
    });

    await axios.put(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
      {
        values: rows
      },
      {
        params: { valueInputOption: 'USER_ENTERED' },
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  }
};
