import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createMainWindow } from './mainWindow.js';
import { setupMonitoringHandlers, cleanupMonitoring } from './monitoring.js';
const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);

app.setName('CloudHouse Agent');
app.setAppUserModelId('CloudHouse Agent');

app.whenReady().then(() => {
    createMainWindow(currentDir);
    setupMonitoringHandlers();
    app.applicationMenu = null; 
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow(currentDir);
});

app.on('will-quit', () => {
    cleanupMonitoring();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});