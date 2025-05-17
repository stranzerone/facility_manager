import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export default RequestForApprovalApi = async (payload) => {
  try {
    // Fetch user info from AsyncStorage
    const userInfo = await AsyncStorage.getItem('userInfo');

    if (!userInfo) {
      throw new Error('User information not found in AsyncStorage');
    }

    // Parse userInfo and extract necessary fields
    const parsedUserInfo = JSON.parse(userInfo);
    const userId = parsedUserInfo.data.id;
    const apiToken = parsedUserInfo.data.api_token;
    const societyId = parsedUserInfo.data.societyId;
    const societyInfo = await AsyncStorage.getItem('societyInfo');
    const siteUuid = societyInfo ? JSON.parse(societyInfo) : null;

    // Set site_uuid explicitly in payload
    payload.site_uuid = siteUuid;

    // Construct the dynamic payload (mpayload)
    const mpayload = {
      ...payload.issue,  // Copy all fields from issue
      Status: "PENDING",  // Override status with 'PENDING'
      site_uuid: payload.site_uuid,  // Add site_uuid
      line_items: payload.item,  // Directly pass the item array
    };


    // Headers for authentication
    const headers = {
      'Content-Type': 'application/json',
      'ism-auth': JSON.stringify({
        "api-token": apiToken,
        "user-id": userId,
        "site-id": societyId
      })
    };

    // Send the request with the updated payload in the body
    const response = await axios.put(`${API_URL}/v3/stock/request`, mpayload, { 
      headers 
    });
    return response.data;

  } catch (error) {
    console.error('Error fetching data:', error.message || error);
    throw error;
  }
};
