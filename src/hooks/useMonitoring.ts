import { useState, useEffect, useCallback, useRef } from 'react';
import { saveActivity, syncActivityLogs } from "./activityStorage";
import { useAppDispatch } from "@/store/hooks";


interface ActivityData {
    id: number;
    activityId: number;
    keyActions: number;
    mouseActions: number;
    screenshot: string;
    startTime: string;
    endTime: string;
    subtaskId: number;
    workDiaryID: number;
    taskActivityId: number;
}

type StartMonitoringFunc = (intervel: number, id: string, workDiaryID: number, taskActivityId: number) => void;
type StopMonitoringFunc = (id: string, workDiaryID: number, taskActivityId: number) => void;

export const useMonitoring = (): {
    startMonitoring: StartMonitoringFunc,
    stopMonitoring: StopMonitoringFunc,
    latestLogEntry: ActivityData | null;
} => {
    const dispatch = useAppDispatch();
    const [latestLogEntry, setLogEntries] = useState<ActivityData | null>(null);
    const startMonitoring: StartMonitoringFunc = useCallback((intervel: number, subId: string, workDiaryID: number, taskActivityId: number) => {
        if (subId && window.electron && taskActivityId) {
            window.electron.send('start-monitoring', intervel*1000, subId, workDiaryID, taskActivityId);
        }
    }, []);
    const stopMonitoring = useCallback((subId: string, workDiaryID: number, taskActivityId: number) => {
        if (subId && window.electron && taskActivityId) {
            window.electron.send('stop-monitoring', subId, workDiaryID, taskActivityId);
        }
    }, []);
    useEffect(() => {
        if (!window.electron) return;
        const handler = (data: ActivityData) => {

            if (data.subtaskId) {
                setLogEntries(data)
                saveActivity(data);
                syncActivityLogs(dispatch);
            }
        };

        const cleanup = window.electron.on('periodic-data', handler);
        return () => cleanup();
    }, []);

    return { startMonitoring, stopMonitoring, latestLogEntry };
};