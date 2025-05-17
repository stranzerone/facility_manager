import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllUsersApi } from '../../service/GetUsersApi/GetAllUsersApi';

// Async thunk to fetch all users
export const fetchAllUsers = createAsyncThunk(
  'allUsers/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllUsersApi();

      // Ensure the response is converted to an array
      const usersArray = Array.isArray(response)
        ? response
        : Object.values(response); // Converts an object to an array of its values

      return usersArray; // Return the array
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch users'
      );
    }
  }
);


const allUsersSlice = createSlice({
  name: 'allUsers',
  initialState: {
    data: [], // Array of user objects
    loading: false,
    error: null,
  },
  reducers: {
    clearAllUsers: (state) => {
      state.data = [];
      state.error = null;
    },
    getUserNameById: (state, action) => {
      const userId = action.payload; // Extract user_id from action.payload
      const user = state.data.find((user) => user.user_id === userId); // Find the user
      return user ? user.name : 'Unknown User'; // Return the user's name or fallback
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // Store fetched user data
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Capture any errors
      });
  },
});

// Export actions
export const { clearAllUsers, getUserNameById } = allUsersSlice.actions;

// Export reducer
export default allUsersSlice.reducer;
