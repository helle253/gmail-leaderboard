import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('appInfo', {
  name: 'gmail-leaderboard',
  version: '0.1.0',
});
