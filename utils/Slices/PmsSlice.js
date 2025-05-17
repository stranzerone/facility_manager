// ./app/redux/pmsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {GetAllPmsApi} from "../../service/PMS/GetAllPms"
// Thunk to fetch all Pms data from the API
export const fetchAllPms = createAsyncThunk(
  'pms/fetchAllPms',
  async () => {
    const response = await GetAllPmsApi(); // API call to fetch all Pms data
    return response.data; // Assuming the API response contains a list of Pms
  }
);

const pmsSlice = createSlice({
  name: 'pms',
  initialState: {
    list: {}, // Object with UUIDs as keys and Pms data as values
    status: 'idle', // Track loading state
    error: null, // Track errors
  },
  reducers: {
    sendPmsOnRequest: (state) => {
      // Action to send all Pms data
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPms.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllPms.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Store the fetched Pms data with UUID as keys
        action.payload.forEach((pm) => {
          state.list[pm.uuid] = pm; // Storing each Pm object with its UUID as the key
        });
      })
      .addCase(fetchAllPms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

// Action to send Pms data on request
export const { sendPmsOnRequest } = pmsSlice.actions;

// Selector to access the list of all Pms
export const selectAllPms = (state) => state.pms.list;

export default pmsSlice.reducer;
