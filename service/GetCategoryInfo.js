import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL} from '@env';

export const GetCategory = async () => {




  try {


    const userInfo = await AsyncStorage.getItem('userInfo');
    const societyInfo = await  AsyncStorage.getItem('societyInfo');

    if (!userInfo) {
      throw new Error('User information  not found in AsyncStorage');
    }

    // Parse userInfo and access data object inside it
    const parsedUserInfo = JSON.parse(userInfo);

      // Extract user_id (id) and api_token
      const userId = parsedUserInfo.data.id; 
      const apiToken = parsedUserInfo.data.api_token;
      const societyId =parsedUserInfo.data.societyId
      const site_uuid = JSON.parse(societyInfo);

    const params = {
   
  site_uuid:site_uuid,
  "api-token": apiToken,    
  "user-id": userId,      
  "api-token": apiToken,    
  "user-id": userId,    

    };

    const headers = {
      'Content-Type': 'application/json',
      'ism-auth': JSON.stringify({
        "api-token": apiToken,     // Dynamic from AsyncStorage
        "user-id": userId,         // Dynamic from AsyncStorage
        "site-id":  societyId     // If siteId is not available, fallback to default
      })
    };

    // Make the API request
    const response = await axios.get(`${API_URL}/v3/category/ppm`, { params, headers });
    // Check the response data
  return response.data

  } catch (error) {
    console.error('Error fetching data:', error.message || error);
    throw error; // Rethrow error to handle it later
  }
};
