import { app, BrowserWindow, globalShortcut } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createMainWindow } from './mainWindow.js';
import { setupMonitoringHandlers, cleanupMonitoring } from './monitoring.js';
import { setupAutoUpdater } from './update.js';
import { setupAutoStart } from './autoStart.js';
import { registerGlobalShortcuts, unregisterShortcuts } from './shortcutService.js';

const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);

let mainWindow = null;

app.setName('CloudHouse Agent');
app.setAppUserModelId('CloudHouse Agent');

app.whenReady().then(() => {
    setupAutoStart();
    mainWindow = createMainWindow(currentDir);
    registerGlobalShortcuts(mainWindow);
    setupMonitoringHandlers();
    app.applicationMenu = null;
    setupAutoUpdater(currentDir);
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow(currentDir);
        registerGlobalShortcuts(mainWindow);
    }
});

app.on('will-quit', () => {
    cleanupMonitoring();
    unregisterShortcuts(); 
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});