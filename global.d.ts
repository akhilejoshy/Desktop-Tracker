interface ElectronAPI {
    send: (channel: 'start-monitoring' | 'stop-monitoring' | 'save-screenshot', ...args: any[]) => void;
    on: (channel: 'periodic-data', func: (data: any) => void) => () => void;
    openExternal: (url: string) => void;
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}
export { };