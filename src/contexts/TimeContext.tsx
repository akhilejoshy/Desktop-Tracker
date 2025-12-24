"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { format } from 'date-fns';
import { useAppSelector } from '@/store/hooks';

interface TimeContextType {
  punchInTime: string | null;
  totalWorkSeconds: number;
  sessionWorkSeconds: number;
  isTimerRunning: boolean;
  startTimer: (subtaskId: string) => void;
  stopTimer: () => void;
  setTimerRunning: (isRunning: boolean) => void;
  setTotalWorkSeconds: React.Dispatch<React.SetStateAction<number>>;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export const TimeProvider = ({ children }: { children: ReactNode }) => {
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [totalWorkSeconds, setTotalWorkSeconds] = useState<number>(0);
  const [sessionWorkSeconds, setSessionWorkSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [currentSubtaskId, setCurrentSubtaskId] = useState<string | null>(null);

  const workDiary = useAppSelector((sate) => sate.task.workDiary)

  useEffect(() => {
    const today = new Date().toDateString();
    const storedPunchInDate = localStorage.getItem('punchInDate');

    if (storedPunchInDate === today) {
      setPunchInTime(localStorage.getItem('punchInTime'));
      const storedTotal = Number(localStorage.getItem('totalWorkSeconds') || 0);
      setTotalWorkSeconds(storedTotal);
    } else {
      localStorage.removeItem('punchInTime');
      localStorage.removeItem('punchInDate');
      localStorage.removeItem('totalWorkSeconds');
    }
  }, []);

  useEffect(() => {
    if (workDiary?.total_work_time){
      const [hours, minutes, seconds] = workDiary.total_work_time.split(":").map(Number);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      setTotalWorkSeconds(totalSeconds)
    }
  }, [workDiary])

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTimerRunning && sessionStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const sessionSecs = Math.floor((now - sessionStartTime) / 1000);
        setSessionWorkSeconds(sessionSecs);

        const storedTotal = Number(localStorage.getItem('totalWorkSeconds') || 0);
        const newTotalWorkTime = storedTotal + sessionSecs;
        setTotalWorkSeconds(newTotalWorkTime)

      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, sessionStartTime, currentSubtaskId]);


  const startTimer = useCallback((subtaskId: string) => {
    const now = new Date();
    if (!punchInTime) {
      const formattedTime = format(now, 'hh:mm a');
      setPunchInTime(formattedTime);
      localStorage.setItem('punchInTime', formattedTime);
      localStorage.setItem('punchInDate', now.toDateString());
    }
    setSessionStartTime(Date.now());
    setSessionWorkSeconds(0);
    setIsTimerRunning(true);
    setCurrentSubtaskId(subtaskId);
  }, [punchInTime]);

  const stopTimer = useCallback(() => {
    if (!sessionStartTime || !currentSubtaskId) return;

    const newTotal = Number(localStorage.getItem('totalWorkSeconds') || 0);
    localStorage.setItem('totalWorkSeconds', String(newTotal));

    setIsTimerRunning(false);
    setSessionStartTime(null);
    setCurrentSubtaskId(null);
    setSessionWorkSeconds(0);
  }, [sessionStartTime, currentSubtaskId]);

  const setTimerRunning = (isRunning: boolean) => {
    if (isRunning) {
      if (!isTimerRunning && currentSubtaskId) {
        startTimer(currentSubtaskId);
      }
    } else {
      if (isTimerRunning) {
        stopTimer();
      }
    }
  }

  return (
    <TimeContext.Provider value={{ punchInTime, totalWorkSeconds, sessionWorkSeconds, isTimerRunning, startTimer, stopTimer, setTimerRunning, setTotalWorkSeconds }}>
      {children}
    </TimeContext.Provider>
  );
};

export const useTime = () => {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error('useTime must be used within a TimeProvider');
  }
  return context;
};
