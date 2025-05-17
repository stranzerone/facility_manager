import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export const getLocationWorkOrder = async (uuid,status,breakdownActive) => {
console.log('called api for location workorder')
//https://nppm-api.isocietymanager.com/v3/workorder/assigned/asset?
  try {
    // Fetch user info and uuid from AsyncStorage
    const userInfo = await AsyncStorage.getItem('userInfo');
// const uuid = await AsyncStorage.getItem('uuid');


    if (!userInfo) {
      throw new Error('User information  not found in AsyncStorage');
    }

    // Parse userInfo and access data object inside it
    const parsedUserInfo = JSON.parse(userInfo);

      // Extract user_id (id) and api_token
      const userId = parsedUserInfo.data.id; 
      const apiToken = parsedUserInfo.data.api_token;
      const societyId =parsedUserInfo.data.societyId


      //https://nppm-api.isocietymanager.com/v3/asset/uuid1
    const params = {
      location_uuid:uuid,
      per_page:'10',
      page_no:'1',
      user_id: userId,
      site_id:societyId,
      Status:status,
      breakdown:breakdownActive,
      "api-token": apiToken,
      "user-id": userId,
      "api-token": apiToken,
      "user-id": userId
    };


    // Make the API request
    const response = await axios.get(`${API_URL}/v3/workorder/assigned/location?`, {params});
    // Check the response data
    const data = response.data.data;

  return data

  } catch (error) {
    console.error('Error fetching data:', error.message || error);
    throw error; // Rethrow error to handle it later
  }
};
