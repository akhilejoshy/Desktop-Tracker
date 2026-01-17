
import { ActivityPayload, submitActivity } from "@/store/slices/activitySlice";

export interface ActivityData {
  id: number,
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

const timeToSeconds = (time: string): number => {
  if (!time || typeof time !== 'string') return 0; // Prevent split() error
  const parts = time.split(":");
  const h = Number(parts[0]) || 0;
  const m = Number(parts[1]) || 0;
  const s = Number(parts[2]) || 0;
  return h * 3600 + m * 60 + s;
};

const secondsToTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
};


const LOCAL_STORAGE_KEY = "activityLogs";
export const saveActivity = (data: ActivityData) => {
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed: ActivityData[] = existing ? JSON.parse(existing) : [];
    parsed.push(data);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));

    const { screenshot, ...rest } = data;
    const startSeconds = timeToSeconds(data.startTime);
    const endSeconds = timeToSeconds(data.endTime);
    const diffSeconds =
      endSeconds >= startSeconds
        ? endSeconds - startSeconds
        : 24 * 3600 - startSeconds + endSeconds;
    const timeGap = secondsToTime(diffSeconds);
    const tempRaw = localStorage.getItem("temp_log");
    const tempObj = tempRaw ? JSON.parse(tempRaw) : { data: [] };
    const totalSeconds =
      tempObj.data.reduce(
        (sum: number, item: any) => sum + (item.timeGap ? timeToSeconds(item.timeGap) : 0),
        0
      ) + diffSeconds;

    const sanitizedItem = {
      ...rest,
      currentTime: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      timeGap,
      totalTime: secondsToTime(totalSeconds),
    };

    tempObj.data.push(sanitizedItem);
    localStorage.setItem("temp_log", JSON.stringify(tempObj));
    console.clear();
    console.log("--- FULL TEMP LOG HISTORY ---");
    const tableData = buildTableWithBreaks(tempObj.data);
    console.table(tableData);
    console.log(JSON.stringify(tempObj.data, null, 2));

    // const today = new Date().toDateString();
    // const storedPunchInDate = localStorage.getItem('punchInDate');
    // if (storedPunchInDate === today) {

    // } else {
    //   localStorage.removeItem('temp_log');
    // }
  } catch (err) {
    console.error("Error in saveActivity:", err);
  }
};

const buildTableWithBreaks = (data: any[]) => {
  const result: any[] = [];

  for (let i = 0; i < data.length; i++) {
    result.push(data[i]);

    const current = data[i];
    const next = data[i + 1];

    if (next && current.endTime !== next.startTime) {
      result.push({
        BREAK: "BREAK",
        from: current.endTime,
        to: next.startTime,
      });
    }
  }

  return result;
};


export const getAllActivities = (): ActivityData[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    return [];
  }
};

function base64ToFile(base64: string, fileName: string, mimeType = "image/png"): File {
  const byteString = atob(base64);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }

  return new File([intArray], fileName, { type: mimeType });
}

export const syncActivityLogs = async (dispatch: (action: any) => any) => {
  const activities = getAllActivities();
  if (activities.length === 0) return;
  for (const activity of activities) {
    let payload: ActivityPayload
    payload = {
      work_diary_id: activity.workDiaryID,
      task_activity_id: activity.taskActivityId,
      keyboard_action: activity.keyActions,
      mouse_action: activity.mouseActions,
      start_time: activity.startTime,
      end_time: activity.endTime
    }
    const formData = new FormData()
    formData.append("data", JSON.stringify(payload))
    const file = base64ToFile(activity.screenshot, "screenshot.png");
    formData.append("image", file);
    try {
      const response = await dispatch(submitActivity(formData)).unwrap();
      if (response.success) {
        const currentStored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
        const updated = currentStored.filter((item: any) => item.id !== activity.id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error("❌ Sync failed:", error);
    }
  }
};