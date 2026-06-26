import * as SignalR from '@microsoft/signalr';
import { storage } from './storage';

export const createSyncClient = async (_userId: string, onNotify: (event: any) => void) => {
  const hostUrl = await storage.get('api_host_url') || 'http://localhost:5000';
  const baseUrl = hostUrl.replace(/\/$/, '');
  
  const connection = new SignalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}/hubs/sync`)
    .withAutomaticReconnect()
    .build();

  connection.on('NotifyBookmarkChanged', onNotify);
  connection.on('NotifyCategoryChanged', onNotify);

  connection.start().catch(console.error);

  return connection;
};
