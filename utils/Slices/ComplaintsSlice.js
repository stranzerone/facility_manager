// ./app/redux/complaintsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintService } from '../../services/apis/complaintApis';

// Thunk to fetch complaints data
export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async () => {
    const response = await complaintService.getAllComplaints(); // Call the API function
    return response; // Return the entire response data
  }
);

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState: {
    list: [], // Array to store complaints data
    status: 'idle', // Track loading state
    error: null, // Track errors
  },
  reducers: {
    // Additional reducers if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload; // Store the complaints data
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

// Selector to access the complaints data
export const selectComplaints = (state) => state.complaints.list;

export default complaintsSlice.reducer;
