import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export const GetWarehouseInfo = async () => {
  try {
    // Fetch user info from AsyncStorage
    const userInfo = await AsyncStorage.getItem('userInfo');
    const societyInfo = await  AsyncStorage.getItem('societyInfo');

    if (!userInfo) {
      throw new Error('User information not found in AsyncStorage');
    }

    // Parse userInfo and extract necessary fields
    const parsedUserInfo = JSON.parse(userInfo);
    const userId = parsedUserInfo.data.id;
    const apiToken = parsedUserInfo.data.api_token;
    const societyId = parsedUserInfo.data.societyId;
    const site_uuid = JSON.parse(societyInfo);

const payload ={
    site_id : site_uuid
}

    // Headers
    const headers = {
      'Content-Type': 'application/json',
      'ism-auth': JSON.stringify({
        "api-token": apiToken,
        "user-id": userId,
        "site-id": societyId
      })
    };
    const response = await axios.get(`${API_URL}/v3/warehouse`, { headers,params: payload});
    return response.data;

  } catch (error) {
    console.error('Error fetching data:', error.message || error);
    throw error;
  }
};
