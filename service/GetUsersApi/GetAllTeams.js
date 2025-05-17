
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export const getAllTeams = async (siteUuId) => {
  const userInfo = await AsyncStorage.getItem('userInfo');
  const soceityInfo = await AsyncStorage.getItem('societyInfo');
  if (userInfo) {

    const parsedUserInfo = JSON.parse(userInfo);
    const site_uuid = JSON.parse(soceityInfo);
    const userId = parsedUserInfo.data.id
    const apiToken = parsedUserInfo.data.api_token
    const societyId =parsedUserInfo.data.societyId
    // const apiUrl = 'https://nppm-api.isocietymanager.com/v3/teams?';


     const params = {
     site_uuid:siteUuId,
    "user-id":userId,
    "api-token":apiToken,
      
    };



    const headers = {
        'Content-Type': 'application/json',
        'ism-auth': JSON.stringify({
          "api-token": apiToken,     // Dynamic from AsyncStorage
          "user-id": userId,         // Dynamic from AsyncStorage
          "site-id":  societyId     // If siteId is not available, fallback to default
        })
      };

    try {
      const response = await axios.get(`${API_URL}/v3/teams?`, { params,headers, withCredentials: true });
    

      return response.data


    } catch (error) {
      console.error('Error fetching data from teams:', error);
      throw error; // Throw error to handle it later
    }
  } else {
    throw new Error('User information not found in AsyncStorage');
  }
};



