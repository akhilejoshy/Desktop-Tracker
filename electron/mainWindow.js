import { BrowserWindow, ipcMain, shell, screen, dialog } from 'electron';
import path from 'path';
import { WINDOW_CONFIG } from './constants.js';
import { isQuitingForUpdate } from './state.js';


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
    win.on('close', (event) => {
        if (isQuitingForUpdate) {
            return;
        }
        event.preventDefault();
        const choice = dialog.showMessageBoxSync(win, {
            type: 'question',
            buttons: ['Cancel', 'Yes, Exit'],
            defaultId: 0,
            cancelId: 0,
            title: 'CloudHouse Agent - Confirm Exit',
            message: 'Are you sure you want to exit CloudHouse Agent?',
            icon: path.join(currentDir, '..', 'icon.png')  
        });
        if (choice === 1) {
            win.destroy();
        }
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
