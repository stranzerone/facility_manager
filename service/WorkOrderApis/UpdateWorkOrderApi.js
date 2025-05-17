import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export const UpdateWorkOrder = async ( uuid, delayReason ) => {
  try {

    // Fetch user information from AsyncStorage
    const userInfo = await AsyncStorage.getItem('userInfo');
    const societyInfo = await AsyncStorage.getItem('societyInfo');
    if (!userInfo) {
      throw new Error('User information not found in AsyncStorage');
    }


    const parsedUserInfo = JSON.parse(userInfo);
    const site_uuid = JSON.parse(societyInfo)
    // Extract necessary data from userInfo
    const userId = parsedUserInfo.data.id;
    const apiToken = parsedUserInfo.data.api_token;
    const societyId = parsedUserInfo.data.societyId;

    // Prepare the headers for authentication
    const headers = {
      'Content-Type': 'application/json',
      'ism-auth': JSON.stringify({
        "api-token": apiToken, // Dynamic from AsyncStorage
        "user-id": userId,     // Dynamic from AsyncStorage
        "site-id": societyId   // Dynamic from AsyncStorage
      })
    };

    // Prepare the payload for the API request
    const payload = {
      flag_delay_reason: delayReason,
      site_uuid: site_uuid,
      updated_by: userId,
      uuid: uuid
    };

    // Make the API request
    const response = await axios.put(`${API_URL}/v3/workorder`, payload, { headers });

    // Check the response data
    return response.data;

  } catch (error) {
    console.error('Error updating work order:', error.message || error);
    throw error; // Rethrow the error for further handling
  }
};
