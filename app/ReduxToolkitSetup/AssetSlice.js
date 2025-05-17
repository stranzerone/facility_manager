// ./app/redux/assetsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'; // Assuming you're using axios for API calls

// Async thunk to fetch assets from an API
export const fetchAssets = createAsyncThunk('assets/fetchAssets', async () => {
  const response = await axios.get('https://api.example.com/assets'); // Replace with your API endpoint
  return response.data; // Assumes the response is in JSON format
});

const assetsSlice = createSlice({
  name: 'assets',
  initialState: {
    data: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {
    // Any additional reducers for handling specific actions can go here
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default assetsSlice.reducer;
