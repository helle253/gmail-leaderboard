import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('appInfo', {
  name: 'gmail-leaderboard',
  version: '0.1.0',
});

contextBridge.exposeInMainWorld('auth', {
  beginGoogle: () => ipcRenderer.invoke('auth:begin-google') as Promise<{ authenticated: boolean }>,
  session: () => ipcRenderer.invoke('auth:session') as Promise<{ authenticated: boolean }>,
  logout: () => ipcRenderer.invoke('auth:logout') as Promise<{ authenticated: boolean }>,
});
