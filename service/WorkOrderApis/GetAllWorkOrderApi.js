import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export const GetAllWorkOrders = async (selectedFilter) => {
  try {
    // Fetch user info and uuid from AsyncStorage
    const userInfo = await AsyncStorage.getItem('userInfo');
// const uuid = await AsyncStorage.getItem('uuid');


    if (!userInfo) {
      throw new Error('User information or UUID not found in AsyncStorage');
    }

    // Parse userInfo and access data object inside it
    const parsedUserInfo = JSON.parse(userInfo);

      // Extract user_id (id) and api_token
      const userId = parsedUserInfo.data.id; 
      const apiToken = parsedUserInfo.data.api_token;
      const societyId =parsedUserInfo.data.societyId

      //
    // const apiUrl ='https://nppm-api.isocietymanager.com/v3/workorder/filter';
    
    // Log the selected filter for debugging

    // Define the parameters for the API call
    const params = {
      site_id: societyId,
      breakdown1:false,
      breakdown2:false,
      breakdown: false,
      Status: selectedFilter,
      page_no: 1,
      per_page: 50,
      user_id: userId,
      'api-token': apiToken,
    };


    const headers = {
      'Content-Type': 'application/json',
      'ism-auth': JSON.stringify({
        "api-token": apiToken,     // Dynamic from AsyncStorage
        "user-id": userId,         // Dynamic from AsyncStorage
        "site-id":  societyId    // If siteId is not available, fallback to default
      })
    };
    // Make the API request
    const response = await axios.get(`${API_URL}/v3/workorder/filter`, { params,headers,withCredentials: true });
    // Check the response data
    const data = response.data.data;

  return data

  } catch (error) {
    console.error('Error fetching data:', error.message || error);
    throw error; // Rethrow error to handle it later
  }
};
