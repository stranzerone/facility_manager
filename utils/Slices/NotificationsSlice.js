// notificationsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintService } from '../../services/apis/complaintApis';

// Async thunk for fetching notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { notifications } = getState(); // Get the current state
      const page = notifications.page; // Use the current page
      const notificationsResponse = await complaintService.getMyNotifications(page);
      return notificationsResponse; // Adjust the structure if needed
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    data: [], // Stores the first 30 notifications
    status: 'idle',
    error: null,
    page: 1, // Tracks the current page being fetched
  },
  reducers: {
    clearNotifications: (state) => {
      state.data = []; // Optional: Clears notifications when needed
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';

        // Extract notifications from API response
        const newNotifications = action.payload.data;

        // Add only the first 30 notifications to the Redux state
        state.data = [...state.data, ...newNotifications].slice(0, 30);

        // Update the page for the next request
        state.page = action.payload.page_no; // Adjust based on API response
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
