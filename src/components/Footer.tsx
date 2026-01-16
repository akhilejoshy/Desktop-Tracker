import React, { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { LogOut } from "lucide-react";
import { useMonitoringContext } from "@/contexts/MonitoringContext";
import { useNavigate } from "react-router-dom";
import { useTime } from "@/contexts/TimeContext";
import { useDispatch } from "react-redux";
import { punchinClear } from "@/store/slices/taskSlice";
import { logout } from "@/store/slices/loginSlice"
import {syncActivityLogs} from "@/hooks/activityStorage"

interface Progress {
  percent: number;
}

interface UpdateInfo {
  version: string;
  isNewer?: boolean;
}

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const subtaskId = localStorage.getItem("subtaskId");
  const taskActivityId = Number(localStorage.getItem("taskActivityId"));
  const workDiaryID = Number(localStorage.getItem("workDiaryId"));
  const { isTimerRunning, stopTimer, setTotalWorkSeconds } = useTime();
  const { stopMonitoring } = useMonitoringContext();
  const dispatch = useDispatch();

  type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "downloaded";
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>("idle");
  const [version, setVersion] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const checkingStartRef = useRef<number | null>(null);
  const safeProgress = Math.min(100, Math.max(0, Math.floor(progress)));

  useEffect(() => {
    const check = async () => {
      const info: UpdateInfo | null = await window.electron.UpdaterAPI.check();
      if (info?.isNewer) {
        setVersion(info.version);
        setUpdateStatus("available");
      } else {
        setVersion("");
        setUpdateStatus("idle");
      }
    };
    check();
  }, []);

  useEffect(() => {
    const removeChecking = window.electron.UpdaterAPI.onChecking(() => {
      checkingStartRef.current = Date.now();
      setUpdateStatus("checking");
    });
    const removeAvailable = window.electron.UpdaterAPI.onAvailable((info) => {
      const minDelay = 2000;
      const elapsed = Date.now() - (checkingStartRef.current ?? 0);

      const finish = () => {
        setVersion(info.version);
        setUpdateStatus("available");
      };

      if (elapsed >= minDelay) finish();
      else setTimeout(finish, minDelay - elapsed);
    });


    const removeNotAvailable = window.electron.UpdaterAPI.onNotAvailable(() => {
      const minDelay = 2000;
      const elapsed = Date.now() - (checkingStartRef.current ?? 0);

      const finish = () => {
        setUpdateStatus("idle");
        setVersion("");
      };

      if (elapsed >= minDelay) finish();
      else setTimeout(finish, minDelay - elapsed);
    });

    const removeProgress = window.electron.UpdaterAPI.onProgress((prog: Progress) => {
      setProgress(prog.percent);
    });

    const removeDownloaded = window.electron.UpdaterAPI.onDownloaded(() => {
      setUpdateStatus("downloaded");
    });

    return () => {
      removeChecking();
      removeAvailable();
      removeNotAvailable();
      removeProgress();
      removeDownloaded();
    };
  }, []);

  const handleUpdateClick = async () => {
    if (updateStatus === "idle" || updateStatus === "checking") {
      setUpdateStatus("checking"); 
      setTimeout(() => {
        navigate("/dashboard");
        navigate(0); 
        syncActivityLogs(dispatch)
      }, 300);
      return;
    }
    if (updateStatus === "available") {
      setUpdateStatus("downloading");
      await window.electron.UpdaterAPI.download();
      return;
    }
    if (updateStatus === "downloaded") {
      await window.electron.UpdaterAPI.install();
    }
  };


  const handleLogout = () => {
    dispatch(punchinClear())
    if (!isTimerRunning) {
      setTotalWorkSeconds(0);
      dispatch(logout())
      navigate("/");
    }
  };

  const renderUpdateIcon = () => {
    switch (updateStatus) {
      case "idle":
        return (
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            {version && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </div>
        );
      case "checking":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 animate-spin"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        );
      case "available":
        return (
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            <span>v{version}</span>
          </div>
        );
      case "downloading": {
        const radius = 14;
        const circumference = 2 * Math.PI * radius;
        return (
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 rotate-[-90deg]">
                <circle
                  className="text-gray-300"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="16"
                  cy="16"
                />
                <circle
                  className="text-blue-500"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="16"
                  cy="16"
                  strokeDasharray={circumference}
                  strokeDashoffset={
                    circumference - (circumference * safeProgress) / 100
                  }
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px]">
                {safeProgress}%
              </span>
            </div>
            <span className="text-sm">v{version}</span>
          </div>

        );
      }
      case "downloaded":
        return <span>Restart</span>;
    }
  };

  return (
    <footer className="sticky bottom-0 z-50 shrink-0 p-2 bg-white flex justify-between items-center">
      <button
        onClick={handleUpdateClick}
        disabled={isTimerRunning}
        className={`p-2 rounded focus:outline-none ${isTimerRunning
            ? "text-muted-foreground"
            : "text-primary"
          }`}
      >
        {renderUpdateIcon()}
      </button>
      <button
        onClick={handleLogout}
        aria-label="Log out"
        disabled={isTimerRunning}
        className="me-2"
      >
        <LogOut
          className={`h-4 w-4 scale-115 ${isTimerRunning
              ? "text-muted-foreground "
              : "text-primary"
            }`}
        />
      </button>
    </footer>
  );
};

export default Footer;
