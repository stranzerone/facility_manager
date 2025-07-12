// ./app/redux/assetsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { workOrderService } from '../../services/apis/workorderApis';

// Async thunk to fetch assets from an API
export const fetchAssets = createAsyncThunk('assets/fetchAssets', async () => {
  const response = await workOrderService.getAsets(); // Fetch staff data
  return response; // Assumes the response is in JSON format
});

const assetsSlice = createSlice({
  name: 'assets', // Clear naming for slice
  initialState: {
    data: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // Additional reducers can be added here if needed in the future
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload; // Store the full data
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

// Selector to access data
export const selectAssets = (state) => state.assets.data;

export default assetsSlice.reducer;
