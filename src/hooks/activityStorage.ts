
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

const LOCAL_STORAGE_KEY = "activityLogs";
export const saveActivity = (data: ActivityData) => {
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed: ActivityData[] = existing ? JSON.parse(existing) : [];
    parsed.push(data);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
  } catch (err) {
  }
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
        const updatedActivities = activities.filter(
          (a) => a.id !== activity.id
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedActivities));
      }
    } catch (error) {
      console.error("❌ Sync failed:", error);
    }
  }
};