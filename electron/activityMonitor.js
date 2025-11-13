import { createRequire } from 'node:module';
import { initialActivityCounts, MIN_MOUSE_MOVEMENT_DISTANCE, MOUSE_POLL_INTERVAL_MS } from './constants.js';

const require = createRequire(import.meta.url);
const robot = require('robotjs');
const GKL_Module = require('node-global-key-listener');
let GlobalKeyListenerConstructor = GKL_Module.GlobalKeyListener || GKL_Module.default?.GlobalKeyListener || GKL_Module.default || GKL_Module;

if (typeof GlobalKeyListenerConstructor !== 'function') {
    for (const key in GKL_Module) {
        const prop = GKL_Module[key];
        if (typeof prop === 'function' && key.charAt(0) === key.charAt(0).toUpperCase()) {
            GlobalKeyListenerConstructor = prop;
            break;
        }
    }
}

let lastMousePos = { x: 0, y: 0 };
let mouseMovementPoll = null;
let activityCounts = { ...initialActivityCounts };
let isMonitoring = false;
const globalKeyListener = new GlobalKeyListenerConstructor();
const startGlobalActivityListeners = () => {
    globalKeyListener.addListener((e) => {
        if (!isMonitoring) return;
        if (e.state === "DOWN") {
            if (e.name && e.name.startsWith('MOUSE ')) {
                activityCounts.mouseActions++;
                // console.log(`[ACTIVITY LOG] MOUSE CLICK: ${e.name}. Count: ${activityCounts.mouseActions}`);
            } else if (e.name) {
                activityCounts.keyActions++;
                // console.log(`[ACTIVITY LOG] KEY PRESS: ${e.name}. Count: ${activityCounts.keyActions}`);
            } else if (e.button) {
                activityCounts.mouseActions++;
                // console.log(`[ACTIVITY LOG] MOUSE CLICK (e.button): Button ${e.button}. Count: ${activityCounts.mouseActions}`);
            }
        }
    });
};

const startMouseMovementPolling = () => {
    if (mouseMovementPoll) return;
    mouseMovementPoll = setInterval(() => {
        const currentPos = robot.getMousePos();
        const distance = Math.abs(currentPos.x - lastMousePos.x) + Math.abs(currentPos.y - lastMousePos.y);
        if (distance > MIN_MOUSE_MOVEMENT_DISTANCE && isMonitoring) {
            activityCounts.mouseActions++;
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
};

export const getAndResetActivityCounts = () => {
    const countsToSend = { ...activityCounts };
    activityCounts = { ...initialActivityCounts };
    return countsToSend;
};