import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export const MarkAsCompleteApi = async ({item,remark,sequence,siteUuid}) => {

  // Fetch user info from AsyncStorage
  const userInfo = await AsyncStorage.getItem('userInfo');
  const societyInfo = await  AsyncStorage.getItem('societyInfo');

  const parsedUserInfo = JSON.parse(userInfo);
 const parsedSocietyInfo = JSON.parse(societyInfo)
 const storedStatusesString = await AsyncStorage.getItem('statusUuid');
 const storedStatuses = storedStatusesString ? JSON.parse(storedStatusesString) : [];

 const getStatusUuid = (statusName) => {

  const status = storedStatuses?.find(item => item.Name === statusName);
  return status ? status.uuid : ""; // Return found UUID or empty string if not found
};
  if (userInfo) {
    const userId = parsedUserInfo.data.id
    const apiToken = parsedUserInfo.data.api_token
    const societyId =parsedUserInfo.data.societyId
    const site_uuid = parsedSocietyInfo

    // Construct the payload correctly

    // ed292f0e-98f5-4126-b252-5bf0dd1a0e4f {"Assigned": [324665], "AssignedTeam": [14929742], "Due Date": "2024-11-15 09:00:00", "Name": "9 am daily wo", "Priority": "Normal", "Sequence No": "WO-34380", "Status": "OPEN", "Type": "PLANNED", "_ID": 12629184, "_LABELS": ["WORKORDER"], "asset_uuid": "3c21d312-d7cd-469e-bd41-2f19fb5f1d2b", "breakdown": false, "category_uuid": "ca47eb9a-106b-4991-a7e6-b4e6886e211e", "created_at": "2024-11-15 03:30:07", "created_by": "SYSTEM", "flag_pm": true, "pm_uuid": "a8d7f640-db14-4940-9a37-21b9119d5f8e", "updated_at": "2024-11-15 03:30:07", "user_id": 324665, "uuid": "ed292f0e-98f5-4126-b252-5bf0dd1a0e4f"} info
    const payload = {
    Status: "COMPLETED",
    closed_by:userId,
    completed_at: new Date().toISOString().replace("T", " ").split(".")[0],
    site_uuid:site_uuid,
    status_uuid: getStatusUuid("COMPLETED"),
    updated_at: new Date().toISOString().replace("T", " ").split(".")[0] ,
    updated_by: userId,
    instruction_remark:remark,
    uuid: item.uuid,
    };


    const headers = {
      'Content-Type': 'application/json',
      'ism-auth': JSON.stringify({
        "api-token": apiToken, // Dynamic from AsyncStorage
        "user-id": userId,     // Dynamic from AsyncStorage
        "site-id": societyId           // If siteId is not available, fallback to default
      })
    };
    // const apiUrl = 'https://nppm-api.isocietymanager.com/v3/workorder?';

    try {
      // Send the PUT request
      const response = await axios.put(`${API_URL}/v3/workorder`, payload, { headers, withCredentials: true });
      // Check if the response is as expected
      if (response.data.status === 'success') {
        return true; // Return success
      } else {
        console.error('API response status was not success:', response.data);
        return false; // Return failure
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Throw error to handle it later
    }
  } else {
    throw new Error('User information not found in AsyncStorage');
  }
};
