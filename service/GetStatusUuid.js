import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL} from '@env';

export const GetStatusUuid = async () => {




  try {
    const userInfo = await AsyncStorage.getItem('userInfo');


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
       "site_id": societyId,
      "user-id": userId,
      "api-token": apiToken,
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
    const response = await axios.get(`${API_URL}/v3/status?`, {params,headers});
    // Check the response data
    await AsyncStorage.setItem('statusUuid', JSON.stringify(response.data.data));

  return response.data

  } catch (error) {
    console.error('Error fetching data:', error.message || error);
    throw error; // Rethrow error to handle it later
  }
};
