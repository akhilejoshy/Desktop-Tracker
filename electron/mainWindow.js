import {  BrowserWindow, ipcMain, shell, screen } from 'electron';
import path from 'path';
import { WINDOW_CONFIG } from './constants.js';

let win = null;
export function createMainWindow(currentDir) {
    if (win) return;
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const { WIDTH, HEIGHT, X_MARGIN, Y_MARGIN } = WINDOW_CONFIG;
    const xPos = screenWidth - WIDTH - X_MARGIN;
    const yPos = screenHeight - HEIGHT - Y_MARGIN;

    win = new BrowserWindow({
        width: WIDTH,
        height: HEIGHT,
        x: xPos,
        y: yPos,
        frame: true,
        titleBarStyle: 'default',
        icon: path.join(currentDir, 'icon.png'),
        maximizable: false,
        resizable: false,
        webPreferences: {
            preload: path.join(currentDir, 'preload.js'),
            contextIsolation: true,
            sandbox: false, 
            nodeIntegration: false,
        },
    });
    ipcMain.handle('open-external', async (_, url) => {
        try {
            await shell.openExternal(url);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    });
    const startUrl = process.env.ELECTRON_START_URL;
    if (startUrl) {
        win.loadURL(startUrl);
        win.webContents.openDevTools();
    } else {
        const htmlPath = path.join(currentDir, '..', 'dist', 'index.html');
        win.loadFile(htmlPath);
    }
}

export function getMainWindow() {
    return win;
}