import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "@/services/EventServices";

interface Subtask {
  id: number;
  name: string;
  description?: string;
}

interface Task {
  id: number;
  name: string;
  assigned_task: number;
  subtasks: Subtask[];
}

interface Project {
  id: number;
  project_name: string;
  assigend_task: number;
  tasks: Task[];
}

interface ProjectState {
  projectsData: Project[];
  workDiary: WorkDiary | null;
  TaskActivity: any;
  loading: boolean;
  error: string | null;
  submissionLoading: boolean;
  submissionError: string | null;
  isPunchedIn: boolean;
  dailyPunchInTime: string | null;
}

const initialState: ProjectState = {
  projectsData: [],
  TaskActivity: [],
  workDiary: null,
  loading: false,
  error: null,
  submissionLoading: false,
  submissionError: null,
  isPunchedIn: false,
  dailyPunchInTime: null,
};

export interface TaskActivity {
  id: number;
  work_diary_id: number;
  sub_task_id: number;
  subtask_name: string;
  start_time: string;
  total_time: string | null;
  description: string;
  activities: any | null;
  total_time_spent: string;
}

export interface WorkDiary {
  id: number;
  employee_id: number;
  punch_in: string;
  total_work_time: string | null;
  date: string;
  avrg_keyboard_action: number;
  avrg_mouse_action: number;
  activity_period: number;
  task_activities: TaskActivity[];
}



interface Activity {
  sub_task_id: number;
  start_time: string;
  description: string;
}

export interface DailyActivityPayload {
  punch_in: string;
  date: string;
  task_activities: Activity[];
}


export const fetchProjectsWithAssignedSubtasks = createAsyncThunk(
  "projects/fetchWithAssignedSubtasks",
  async (_, { rejectWithValue }) => {
    try {
      const assigneeId = localStorage.getItem("userId");

      const url = `/api/v1/employee/${assigneeId}/agent/tasks`;
      const response = await api.getEvents(url);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to fetch projects");
      }
      return rejectWithValue("An unexpected error occurred.");
    }
  }
);


export const fetchDailyActivity = createAsyncThunk(
  "projects/fetchDailyActivity",
  async (_, { rejectWithValue }) => {
    try {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-CA');
      const assigneeId = localStorage.getItem("userId");
      const url = `/api/v1/employee/${assigneeId}/agent?date=${formattedDate}`;
      const response = await api.getEvents(url);
      const data = response.data;
      if (data.data.total_work_time) {
        const [hours, minutes, seconds] = data.data.total_work_time.split(":").map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        localStorage.setItem("totalWorkSeconds", totalSeconds);
      }
      if (data.data.activity_period) {
        localStorage.setItem("activity_period", data.data.activity_period)
      }
      return data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to fetch daily activity");
      }
      return rejectWithValue("An unexpected error occurred.");
    }
  }
);

export const submitDailyActivity = createAsyncThunk(
  "projects/submitDailyActivity",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const assigneeId = localStorage.getItem("userId");
      const url = `/api/v1/employee/${assigneeId}/agent`;
      const response = await api.postEvents(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data || "Failed to submit daily activity"
        );
      }
      return rejectWithValue(
        "An unexpected error occurred during submission."
      );
    }
  }
);

export const updateWorkingStatus = createAsyncThunk(
  "activity/updateWorkingStatus",
  async (
    {
      workingStatus,
      subtaskId,
    }: { workingStatus: boolean; subtaskId?: number },
    { rejectWithValue }
  ) => {
    try {
      const employeeId = localStorage.getItem("userId");
      const url = `/api/v1/employee/${employeeId}/agent/working_status`;
      const response = await api.patchEvent(url, [], {
        params: {
          working_status: workingStatus,
          subtask_id: subtaskId,
        },
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data || "Failed to update working status"
        );
      }
      return rejectWithValue(
        "Unexpected error while updating working status."
      );
    }
  }
);


const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    punchinClear: (state) => {
      state.dailyPunchInTime = null;
      state.workDiary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectsWithAssignedSubtasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectsWithAssignedSubtasks.fulfilled, (state, action) => {
        state.loading = false;
        state.projectsData = action.payload.data;
        state.error = null;
      })
      .addCase(fetchProjectsWithAssignedSubtasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDailyActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.workDiary = action.payload.data;
        state.error = null;
      })
      .addCase(fetchDailyActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitDailyActivity.pending, (state) => {
        state.submissionLoading = true;
        state.submissionError = null;
      })
      .addCase(submitDailyActivity.fulfilled, (state, action) => {
        state.submissionLoading = false;
        state.submissionError = null;
        state.dailyPunchInTime = action.payload.response.data.punch_in;
        state.TaskActivity = action.payload.response.data.task_activities
      })
      .addCase(submitDailyActivity.rejected, (state, action) => {
        state.submissionLoading = false;
        state.submissionError = action.payload as string;
      })
      .addCase(updateWorkingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkingStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateWorkingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { punchinClear } = projectSlice.actions
export default projectSlice.reducer;
