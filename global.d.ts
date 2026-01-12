interface Progress {
  percent: number;
}

interface UpdateInfo {
  version: string;
  isNewer?: boolean;
}

interface SystemInactivePayload {
  reason: 'lock-screen' | 'suspend' | 'shutdown';
}

interface ElectronAPI {
  send: (
    channel: 'start-monitoring' | 'stop-monitoring' | 'save-screenshot',
    ...args: any[]
  ) => void;
  on(channel: 'system-inactive', func: (data: SystemInactivePayload) => void): () => void;
  on(channel: 'periodic-data', func: (data: any) => void): () => void;

  openExternal: (url: string) => void;
  UpdaterAPI: {
    check: () => Promise<UpdateInfo | null>;
    download: () => Promise<void>;
    install: () => Promise<void>;
    onChecking: (callback: () => void) => () => void;
    onAvailable: (callback: (info: UpdateInfo) => void) => () => void;
    onNotAvailable: (callback: () => void) => () => void;
    onProgress: (callback: (prog: Progress) => void) => () => void;
    onDownloaded: (callback: () => void) => () => void;
    onError: (callback: (err: any) => void) => () => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export { };
