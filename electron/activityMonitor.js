import { createRequire } from 'node:module';
import { initialActivityCounts, MIN_MOUSE_MOVEMENT_DISTANCE, MOUSE_POLL_INTERVAL_MS } from './constants.js';
import pkg from 'uiohook-napi';

const { uIOhook } = pkg;
const require = createRequire(import.meta.url);
const robot = require('robotjs');

let lastMousePos = { x: 0, y: 0 };
let mouseMovementPoll = null;
let activityCounts = { ...initialActivityCounts };
let isMonitoring = false;
export const getIsMonitoring = () => isMonitoring;
const startGlobalActivityListeners = () => {
    uIOhook.removeAllListeners('keydown');
    uIOhook.removeAllListeners('mousedown');
    uIOhook.on('keydown', (e) => {
        if (!isMonitoring) return;
        activityCounts.keyActions++;
        // console.log(`[ACTIVITY LOG] KEY PRESS. Total: ${activityCounts.keyActions}`);
    });
    uIOhook.on('mousedown', (e) => {
        if (!isMonitoring) return;
        activityCounts.mouseActions++;
        // console.log(`[ACTIVITY LOG] MOUSE CLICK. Total: ${activityCounts.mouseActions}`);
    });

    try {
        uIOhook.start();
    } catch (err) {
        console.error('Failed to start uIOhook:', err);
    }
};

const startMouseMovementPolling = () => {
    if (mouseMovementPoll) return;
    mouseMovementPoll = setInterval(() => {
        const currentPos = robot.getMousePos();
        const distance = Math.abs(currentPos.x - lastMousePos.x) + Math.abs(currentPos.y - lastMousePos.y);
        if (distance > MIN_MOUSE_MOVEMENT_DISTANCE && isMonitoring) {
            // activityCounts.mouseActions++;
            // console.log(`[ACTIVITY LOG] Mouse moved! Count: ${activityCounts.mouseActions}`);
        }
        lastMousePos = currentPos;
    }, MOUSE_POLL_INTERVAL_MS);
};

const stopMouseMovementPolling = () => {
    if (mouseMovementPoll) {
        clearInterval(mouseMovementPoll);
        mouseMovementPoll = null;
    }
};

export const activateMonitoring = () => {
    activityCounts = { ...initialActivityCounts };
    isMonitoring = true;
    startMouseMovementPolling();
    startGlobalActivityListeners();
};

export const deactivateMonitoring = () => {
    isMonitoring = false;
    stopMouseMovementPolling();
    try {
        uIOhook.stop();
    } catch (e) {
    }
};

export const getAndResetActivityCounts = () => {
    const countsToSend = {
        ...activityCounts,
        id: Date.now()
    };
    activityCounts = {
        ...initialActivityCounts,
        keyActions: 0,
        mouseActions: 0
    };
    return countsToSend;
};