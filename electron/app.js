import { app, BrowserWindow, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createMainWindow } from './mainWindow.js';
import { setupMonitoringHandlers, cleanupMonitoring } from './monitoring.js';

import pkg from "electron-updater";
const { autoUpdater } = pkg;


const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);

app.setName('CloudHouse Agent');
app.setAppUserModelId('CloudHouse Agent');

// --- Configure Update Feed URL (IMPORTANT) ---
autoUpdater.setFeedURL({
    provider: "generic",
    url: "https://cloudhouse.in-maa-1.linodeobjects.com/agent-application"
});

// --- Auto Updater Events ---
autoUpdater.on('checking-for-update', () => console.log('Checking for update...'));
autoUpdater.on('update-available', (info) => console.log('Update available:', info.version));
autoUpdater.on('update-not-available', () => console.log('No update available.'));
autoUpdater.on('error', (err) => console.error('Update error:', err));

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'A new version was downloaded. Restart to apply it?',
        buttons: ['Restart Now', 'Later']
    }).then(result => {
        if (result.response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});

app.whenReady().then(() => {
    createMainWindow(currentDir);
    setupMonitoringHandlers();
    app.applicationMenu = null;

    // CHECK FOR UPDATES
    autoUpdater.checkForUpdatesAndNotify();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
        createMainWindow(currentDir);
});

app.on('will-quit', cleanupMonitoring);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
