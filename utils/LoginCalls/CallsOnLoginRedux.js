// utils/LoginReduxActions.js
import { fetchAssets } from "../Slices/AssetSlice";
import { fetchWorkOrders } from "../Slices/WorkOrderSlice";
import {fetchDataByUuid} from "../Slices/BuggyListSlice";
import { fetchComplaints } from "../Slices/ComplaintsSlice";

/**
 * Function to dispatch all necessary Redux actions on login.
 * @param {Function} dispatch - Redux dispatch function.
 */
export const fetchLoginData = async (dispatch) => {
  try {
    // Fetch assets
    // await dispatch(fetchAssets());

    // Fetch work orders
  


      // Store buggy list in Redux

    
        await dispatch(fetchDataByUuid())
      
        // Dispatch complaints fetch action
        await dispatch(fetchComplaints());
      
 
    
  } catch (error) {
    console.error("Error fetching login data:", error);
  }
};
