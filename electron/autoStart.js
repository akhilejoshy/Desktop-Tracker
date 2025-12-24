import { app } from "electron";
export function setupAutoStart() {
    const exePath = process.execPath;
    app.setLoginItemSettings({
        openAtLogin: true,
        path: exePath,
        args: []
    });
}
