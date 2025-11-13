import { contextBridge, ipcRenderer } from 'electron';
const allowedSendChannels = ['start-monitoring', 'stop-monitoring', 'save-screenshot'];
const allowedReceiveChannels = ['periodic-data'];
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
});
