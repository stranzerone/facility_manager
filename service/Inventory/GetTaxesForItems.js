import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export default GetTaxesForItem = async (uuid) => {
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
    // Payload for filtering data
    const payload = {
      site_id: siteUuid,
      warehouse_id:uuid,
    };

    // Headers
    const headers = {
      'Content-Type': 'application/json',
      'ism-auth': JSON.stringify({
        "api-token": apiToken,
        "user-id": userId,
        "site-id": societyId
      })
    };
    const response = await axios.get(`${API_URL}/v3/taxes`, {
      headers,
      params: payload, // 👈 This is the key fix
    });
    return response.data;

  } catch (error) {
    console.error('Error fetching data:', error.message || error);
    throw error;
  }
};
