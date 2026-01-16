export const initialActivityCounts = {
    keyActions: 0,
    mouseActions: 0,
    startTime:null,
    endTime:null
};

export const IPC_CHANNELS = {
    START_MONITORING: 'start-monitoring',
    STOP_MONITORING: 'stop-monitoring',
    PERIODIC_DATA: 'periodic-data', 
};

export const MIN_MOUSE_MOVEMENT_DISTANCE = 10;
export const MOUSE_POLL_INTERVAL_MS = 500; 

export const WINDOW_CONFIG = {
    WIDTH: 300,
    HEIGHT: 480,
    X_MARGIN: 10,
    Y_MARGIN: 50,
};