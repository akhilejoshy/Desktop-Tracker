import React from "react";
import { useEffect } from "react";
import { useTime } from "../contexts/TimeContext";
import { fetchDailyActivity } from "@/store/slices/taskSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const formatSeconds = (seconds: number): string => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const formatTo12Hour = (timeString?: string | null) => {
  if (!timeString) return "";
  const date = new Date(`1970-01-01T${timeString}`);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};



const Header: React.FC = () => {
  const { totalWorkSeconds } = useTime();
  const { workDiary, dailyPunchInTime } = useAppSelector((state) => state.task)

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchDailyActivity()).unwrap()
  }, [])


  return (
    <header  className="sticky top-0 z-50 shrink-0 p-3 px-4 shadow-md bg-white">
      <div className="flex justify-between text-sm font-medium">
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Punch-in</span>
          <span className="font-semibold text-primary">
            {formatTo12Hour(workDiary?.punch_in) || formatTo12Hour(dailyPunchInTime) || "--:-- -"}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground">Total Work Time</span>
          <span className="font-semibold text-primary">{formatSeconds(totalWorkSeconds)}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
