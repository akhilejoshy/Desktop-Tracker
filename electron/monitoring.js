import { ipcMain, desktopCapturer, Notification, BrowserWindow } from 'electron';
import { getAndResetActivityCounts, activateMonitoring, deactivateMonitoring } from './activityMonitor.js';
import { IPC_CHANNELS } from './constants.js';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
let monitoringInterval = null;
let lastEndTime = null;

const captureScreenElectronAPI = async () => {
    const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
    });
    const primaryScreen = sources.find(source =>
        source.name === 'Entire Screen' ||
        source.name.toLowerCase().includes('screen')
    );
    if (!primaryScreen) {
        console.error('Could not find entire screen source using desktopCapturer.');
        return null;
    }
    const base64Image = primaryScreen.thumbnail.toPNG().toString('base64');
    showScreenshotNotification();
    return base64Image;
};

const captureScreenLinuxNative = () => {
    return new Promise((resolve, reject) => {
        const tempPath = path.join(os.tmpdir(), `screenshot-${Date.now()}.png`);
        const command = `scrot ${tempPath}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing scrot: ${error.message}. Is 'scrot' installed?`);
                return resolve(null);
            }
            try {
                const imageBuffer = fs.readFileSync(tempPath);
                const base64Image = imageBuffer.toString('base64');
                fs.unlinkSync(tempPath);
                showScreenshotNotification();

                resolve(base64Image);
            } catch (fsError) {
                console.error(`File system error during screenshot read/cleanup: ${fsError.message}`);
                resolve(null);
            }
        });
    });
};

const captureScreen = () => {
    const platform = process.platform;
    if (platform === 'linux') {
        return captureScreenLinuxNative();
    } else if (platform === 'win32' || platform === 'darwin') {
        return captureScreenElectronAPI();
    } else {
        console.error(`Screen capture not supported on platform: ${platform}`);
        return Promise.resolve(null);
    }
};

const showScreenshotNotification = () => {
    const notification = new Notification({
        title: 'Screenshot Captured',
        body: 'A screenshot has been successfully taken.',
        silent: false,
        icon: './icon.ico',
    });

    notification.on('click', () => {
        const win = BrowserWindow.getAllWindows()[0]; 
        if (win) {
            if (win.isMinimized()) win.restore();
            win.show();
            win.focus();
        }
    });

    notification.show();
};

function formatTime(date) {
    return date.toLocaleTimeString('en-GB', { hour12: false });
}

export function setupMonitoringHandlers() {
    ipcMain.on(IPC_CHANNELS.START_MONITORING, (event, intervalMs, subtaskId, workDiaryID, taskActivityId) => {        
        if (monitoringInterval) clearInterval(monitoringInterval);
        activateMonitoring();
        const now = new Date();
        lastEndTime = now;
        captureScreen().then(base64Image => {
            const counts = getAndResetActivityCounts();
            const payload = {
                ...counts,
                screenshot: base64Image,
                startTime: formatTime(now),
                endTime: formatTime(now),
                subtaskId: subtaskId,
                taskActivityId: taskActivityId,
                workDiaryID: workDiaryID
            };
            event.sender.send(IPC_CHANNELS.PERIODIC_DATA, payload);
        });
        monitoringInterval = setInterval(async () => {
            const currentTime = new Date();
            const startTime = lastEndTime;
            const endTime = currentTime;
            lastEndTime = endTime;
            const base64Image = await captureScreen();
            const counts = getAndResetActivityCounts();
            const payload = {
                ...counts,
                screenshot: base64Image,
                startTime: formatTime(startTime),
                endTime: formatTime(endTime),
                subtaskId: subtaskId,
                taskActivityId: taskActivityId,
                workDiaryID: workDiaryID
            };
            event.sender.send(IPC_CHANNELS.PERIODIC_DATA, payload);
        }, intervalMs);
    });

    ipcMain.on(IPC_CHANNELS.STOP_MONITORING, (event, subtaskId, workDiaryID, taskActivityId) => {
        const stopTime = new Date();
        const startTime = lastEndTime;
        captureScreen().then(base64Image => {
            const counts = getAndResetActivityCounts();
            const payload = {
                ...counts,
                screenshot: base64Image,
                startTime: formatTime(startTime),
                endTime: formatTime(stopTime),
                subtaskId: subtaskId,
                taskActivityId: taskActivityId,
                workDiaryID: workDiaryID

            };
            event.sender.send(IPC_CHANNELS.PERIODIC_DATA, payload);
        });
        deactivateMonitoring();
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            monitoringInterval = null;
        }
        lastEndTime = null;
    });
}

export function cleanupMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }
    deactivateMonitoring();
}