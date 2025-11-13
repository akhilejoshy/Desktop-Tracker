import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useMonitoring } from "@/contexts/MonitoringContext";
import { useTime } from "@/contexts/TimeContext";
import { useDispatch } from "react-redux";
import { punchinClear } from "@/store/slices/taskSlice";
import { logout } from "@/store/slices/loginSlice";


const Footer: React.FC = () => {
  const subtaskId = localStorage.getItem("subtaskId")
  const taskActivityId = Number(localStorage.getItem("taskActivityId"))
  const workDiaryID = Number(localStorage.getItem("workDiaryID"))
  const { isTimerRunning, stopTimer, setTotalWorkSeconds } = useTime();
  const { stopMonitoring } = useMonitoring();

  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(punchinClear())
    if (isTimerRunning) {
      stopTimer();
      if (subtaskId && taskActivityId && workDiaryID) {
        stopMonitoring(subtaskId, workDiaryID, taskActivityId);
      }
    }
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    setTotalWorkSeconds(0);
    dispatch(logout())
    navigate("/");
  };

  return (
    <footer className="sticky bottom-0 z-50 shrink-0 p-2 bg-white">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <LogOut className="h-6 w-6 text-primary" />
        </Button>
      </div>
    </footer>
  );
};

export default Footer;
