// update.js
import { setQuitForUpdate, setLatestVersion, latestVersion } from './state.js';
import { ipcMain, BrowserWindow, app, dialog } from 'electron';
import { getIsMonitoring } from './activityMonitor.js';
import path from 'path';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

export function setupAutoUpdater(currentDir) {
  autoUpdater.autoDownload = false;

  autoUpdater.on('checking-for-update', () => {
    BrowserWindow.getAllWindows().forEach(win =>
      win.webContents.send('update-checking')
    );
  });

  autoUpdater.on('update-available', (info) => {
    info.isNewer = app.getVersion() !== info.version;
    BrowserWindow.getAllWindows().forEach(win =>
      win.webContents.send('update-available', info)
    );
  });

  autoUpdater.on('update-not-available', () => {
    BrowserWindow.getAllWindows().forEach(win =>
      win.webContents.send('update-not-available')
    );
  });

  autoUpdater.on('download-progress', (progress) => {
    BrowserWindow.getAllWindows().forEach(win =>
      win.webContents.send('update-download-progress', progress)
    );
  });

  autoUpdater.on('update-downloaded', (info) => {
    setLatestVersion(info.version);
    BrowserWindow.getAllWindows().forEach(win =>
      win.webContents.send('update-downloaded', info)
    );
  });

  autoUpdater.on('error', (err) => {
    BrowserWindow.getAllWindows().forEach(win =>
      win.webContents.send('update-error', err)
    );
  });

  ipcMain.handle('check-update', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      const updateInfo = result.updateInfo || null;
      if (updateInfo) {
        updateInfo.isNewer = app.getVersion() !== updateInfo.version;
      }
      return updateInfo;
    } catch (err) {
      console.error(err);
      return null;
    }
  });


  ipcMain.handle('download-update', async () => {
    await autoUpdater.downloadUpdate();
  });

  ipcMain.handle('install-update', async () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (getIsMonitoring()) {
      await dialog.showMessageBox(win, {
        type: 'warning',
        title: 'Monitoring Active',
        message: 'Monitoring is currently running.\nStop monitoring before installing updates.',
        buttons: ['OK'],
        icon: path.join(currentDir, '..', 'icon.png')
      });
      return { blocked: true };
    }

    const versionText = latestVersion ? ` (v${latestVersion})` : '';

    const result = await dialog.showMessageBox(win, {
      type: 'info',
      title: 'Update Ready',
      message: `A new version${versionText} was downloaded. Restart to apply it?`,
      buttons: ['Restart Now', 'Later'],
      icon: path.join(currentDir, '..', 'icon.png')
    });

    if (result.response === 0) {
      setQuitForUpdate(true);
      autoUpdater.quitAndInstall();
    }
  });
}
