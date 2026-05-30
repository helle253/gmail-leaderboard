import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { app, BrowserWindow, ipcMain } from 'electron';

import { type AuthSession, beginGoogleAuth } from './utils/auth/google/beginGoogleAuth';
import { createWindow } from './utils/window/createWindow';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let authSession: AuthSession = { authenticated: false };

app.whenReady().then(() => {
  createWindow(__dirname);

  ipcMain.handle('auth:begin-google', async () => {
    authSession = await beginGoogleAuth();
    return authSession;
  });
  ipcMain.handle('auth:session', () => authSession);
  ipcMain.handle('auth:logout', () => {
    authSession = { authenticated: false };
    return authSession;
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(__dirname);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
