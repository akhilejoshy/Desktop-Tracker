import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "@/services/EventServices";

interface ActivityState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: ActivityState = {
  loading: false,
  success: false,
  error: null,
};

export interface ActivityPayload {
  work_diary_id: number;
  task_activity_id: number;
  keyboard_action: number;
  mouse_action: number;
  start_time: string;
  end_time: string;
}

export const submitActivity = createAsyncThunk(
  "projects/submitActivity",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const assigneeId = localStorage.getItem("userId");
      const url = `/api/v1/employee/${assigneeId}/agent/activity`;
      const response = await api.postEvents(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data || "Failed to submit activity"
        );
      }
      return rejectWithValue(
        "Unexpected error during activity submission."
      );
    }
  }
);

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitActivity.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(submitActivity.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitActivity.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      });
  },
});

export default activitySlice.reducer;