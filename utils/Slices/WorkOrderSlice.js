// ./app/redux/workOrdersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GetAllWorkOrders } from '../../service/WorkOrderApis/GetAllWorkOrderApi';

// Async thunk to fetch work orders for predefined statuses
export const fetchWorkOrders = createAsyncThunk(
  'workOrders/fetchWorkOrders',
  async (_, { rejectWithValue }) => {
    const filters = ['OPEN', 'STARTED', 'COMPLETED', 'HOLD', 'CANCELLED', 'REOPEN'];
    let allWorkOrders = [];

    try {
      for (const status of filters) {
        const response = await GetAllWorkOrders(status);

        if (response?.length > 0) {
          allWorkOrders = [...allWorkOrders, ...response];
        }
      }

      if (allWorkOrders.length === 0) {
        throw new Error('No work orders found.');
      }

      return allWorkOrders;
    } catch (error) {
      console.error('Error fetching work orders:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

const workOrdersSlice = createSlice({
  name: 'workOrders',
  initialState: {
    data: [], // All work orders
    filteredData: [], // Filtered work orders
    status: 'idle', // Fetching status ('idle', 'loading', 'succeeded', 'failed')
    error: null, // Error message
  },
  reducers: {
    filterWorkOrders: (state, action) => {
      const status = action.payload;

      if (status) {
        // Filter based on work order status
        state.filteredData = state.data.filter((item) => item.wo.status === status);
      } else {
        // Reset to full data if no filter applied
        state.filteredData = [...state.data];
      }
    },
    resetWorkOrders: (state) => {
      state.filteredData = [...state.data]; // Reset filtered data to all data
    },
    updateWorkOrderStatus: (state, action) => {
      const { id, status } = action.payload;
      const workOrder = state.data.find((item) => item.wo.uuid == id);
      if (workOrder) {
        workOrder.wo.Status = status; // Update the status in all work orders
      }

      // Update filtered data as well
      const filteredWorkOrder = state.filteredData.find((wo) => wo.id === id);
      if (filteredWorkOrder) {
        filteredWorkOrder.wo.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWorkOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.filteredData = action.payload;
      })
      .addCase(fetchWorkOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch work orders.';
      });
  },
});

// Export actions
export const { filterWorkOrders, resetWorkOrders, updateWorkOrderStatus } = workOrdersSlice.actions;

// Selectors
export const selectWorkOrders = (state) => state.workOrders.data;
export const selectFilteredWorkOrders = (state) => state.workOrders.filteredData;
export const selectWorkOrdersStatus = (state) => state.workOrders.status;
export const selectWorkOrdersError = (state) => state.workOrders.error;

export default workOrdersSlice.reducer;
