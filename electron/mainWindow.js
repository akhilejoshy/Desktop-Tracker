import { BrowserWindow, ipcMain, shell, screen, dialog, Menu, powerMonitor } from 'electron';
import path from 'path';
import { WINDOW_CONFIG } from './constants.js';
import { isQuitingForUpdate } from './state.js';
import { getIsMonitoring } from './activityMonitor.js';


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
        if (getIsMonitoring()) {
            event.preventDefault();
            dialog.showMessageBoxSync(win, {
                type: 'warning',
                buttons: ['OK'],
                defaultId: 0,
                title: 'Monitoring Active',
                message: 'Monitoring is currently running.\nStop monitoring before exiting the application.',
                icon: path.join(currentDir, '..', 'icon.png')
            });
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
        win.webContents.openDevTools({ mode: 'detach' });
    } else {
        const htmlPath = path.join(currentDir, '..', 'dist', 'index.html');
        win.loadFile(htmlPath);
    }


    win.webContents.on('context-menu', (event, params) => {
        const menu = Menu.buildFromTemplate([
            {
                label: 'Inspect',
                click: () => {
                    win.webContents.openDevTools({ mode: 'detach' });
                },
            },
        ]);
        menu.popup({ window: win });
    });


    powerMonitor.on('lock-screen', () => {
        if (win) {
            console.log("lock-screen")
            win.webContents.send('system-inactive', { reason: 'lock-screen' });
        }
    });
    powerMonitor.on('suspend', () => {
        if (win) {
            console.log("suspend")

            win.webContents.send('system-inactive', { reason: 'suspend' });
        }
    });
    return win;
}

export function getMainWindow() {
    return win;
}
