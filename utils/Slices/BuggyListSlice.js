// ./app/redux/buggyListSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GetInstructionsApi } from '../../service/BuggyListApis/GetInstructionsApi';

// Thunk to fetch data for a single UUID
export const fetchDataByUuid = createAsyncThunk(
  'buggyList/fetchDataByUuid',
  async (uuid) => {
    const response = await GetInstructionsApi(uuid); // Await the API call
    return { uuid, data: response.data }; // Returning UUID and full response data
  }
);

const buggyListSlice = createSlice({
  name: 'buggyList',
  initialState: {
    list: {}, // Object with UUIDs as keys and response data as values
    status: 'idle', // Track loading state
    error: null, // Track errors
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataByUuid.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDataByUuid.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Store data for the UUID as received in response
        state.list[action.payload.uuid] = action.payload.data;
      })
      .addCase(fetchDataByUuid.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

// Selector to access the buggy list data
export const selectBuggyList = (state) => state.buggyList.list;

export default buggyListSlice.reducer;
