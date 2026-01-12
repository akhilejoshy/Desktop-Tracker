import { contextBridge, ipcRenderer } from 'electron';
const allowedSendChannels = ['start-monitoring', 'stop-monitoring', 'save-screenshot'];
const allowedReceiveChannels = ['periodic-data','system-inactive'];
contextBridge.exposeInMainWorld('electron', {
    send: (channel, ...args) => {
        if (allowedSendChannels.includes(channel)) {
            ipcRenderer.send(channel, ...args);
        }
    },

    on: (channel, func) => {
        if (allowedReceiveChannels.includes(channel)) {
            const safeFunc = (event, data) => func(data);
            ipcRenderer.on(channel, safeFunc);
            return () => ipcRenderer.removeListener(channel, safeFunc);
        }
        return () => { };
    },

    openExternal: (url) => {
        ipcRenderer.invoke('open-external', url);
    },

    UpdaterAPI: {
        check: () => ipcRenderer.invoke('check-update'),
        download: () => ipcRenderer.invoke('download-update'),
        install: () => ipcRenderer.invoke('install-update'),
        onChecking: (cb) => {
            const handler = () => cb();
            ipcRenderer.on('update-checking', handler);
            return () => ipcRenderer.removeListener('update-checking', handler);
        },
        onAvailable: (cb) => {
            const handler = (event, info) => cb(info);
            ipcRenderer.on('update-available', handler);
            return () => ipcRenderer.removeListener('update-available', handler);
        },
        onNotAvailable: (cb) => {
            const handler = () => cb();
            ipcRenderer.on('update-not-available', handler);
            return () => ipcRenderer.removeListener('update-not-available', handler);
        },
        onProgress: (cb) => {
            const handler = (event, progress) => cb(progress);
            ipcRenderer.on('update-download-progress', handler);
            return () => ipcRenderer.removeListener('update-download-progress', handler);
        },
        onDownloaded: (cb) => {
            const handler = (event, info) => cb(info);
            ipcRenderer.on('update-downloaded', handler);
            return () => ipcRenderer.removeListener('update-downloaded', handler);
        },
        onError: (cb) => {
            const handler = (event, err) => cb(err);
            ipcRenderer.on('update-error', handler);
            return () => ipcRenderer.removeListener('update-error', handler);
        },
    },
});
