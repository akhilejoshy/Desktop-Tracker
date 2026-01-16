import { globalShortcut } from 'electron';

export function registerGlobalShortcuts(mainWindow) {
    if (!mainWindow) return;

    globalShortcut.unregisterAll();

    const ret = globalShortcut.register('Alt+Shift+M', () => {
        if (!mainWindow || mainWindow.isDestroyed()) return;
        if (mainWindow.isVisible() && !mainWindow.isMinimized()) {
            mainWindow.minimize();
            return;
        }
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
        mainWindow.show();
        mainWindow.focus();
        setTimeout(() => {
            if (!mainWindow.isDestroyed()) {
                mainWindow.setAlwaysOnTop(false);
            }
        }, 300);
    });
    if (!ret) {
        console.error('Shortcut registration failed!');
    } else {
        console.log('Shortcut Alt+Shift+T registered (toggle mode)');
    }
}

export function unregisterShortcuts() {
    globalShortcut.unregisterAll();
}
