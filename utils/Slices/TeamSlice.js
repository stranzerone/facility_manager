import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { workOrderService } from '../../services/apis/workorderApis';

// Async thunk to fetch all Teams
export const fetchAllTeams = createAsyncThunk(
  'teams/fetchAllTeams',
  async (_, { rejectWithValue }) => {
    try {
      const siteUuId = await workOrderService.getSiteInfo()
      const response = await workOrderService.getAllTeams(siteUuId);
      console.log(response,'this is for teams')
      const teamsArray = Array.isArray(response.data)
        ? response.data
        : Object.values(response.data || {});

      return teamsArray; // Ensure the payload is an array
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch Teams');
    }
  }
);


const allTeamsSlice = createSlice({
  name: 'allTeams',
  initialState: {
    data: [], // Array of Team objects
    loading: false,
    error: null,
  },
  reducers: {
    clearAllTeams: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // Store fetched team data
      })
      .addCase(fetchAllTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Capture any errors
      });
  },
});

// Selector to get a team name by ID
export const selectTeamNameById = (state, teamId) => {
  const team = state.allTeams.data.find((team) => team.team_id === teamId);
  return team ? team.name : 'Unknown Team';
};

// Export actions
export const { clearAllTeams } = allTeamsSlice.actions;

// Export reducer
export default allTeamsSlice.reducer;
