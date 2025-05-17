// app/utils/fetchAllData.js
import { fetchAllUsers } from '../../utils/Slices/UsersSlice';
import { fetchAllTeams } from '../../utils/Slices/TeamSlice';
import { fetchAssets } from '../../utils/Slices/AssetSlice';
import { fetchAllPms } from '../../utils/Slices/PmsSlice';
/**
 * Function to dispatch all Redux actions for fetching data
 * @param {function} dispatch - Redux dispatch function
 */
export const fetchAllReduxData = async (dispatch) => {
  await Promise.all([
    dispatch(fetchAllUsers()),
    dispatch(fetchAllTeams()),
    dispatch(fetchAssets()),
    dispatch(fetchAllPms()),
  ]);
};
