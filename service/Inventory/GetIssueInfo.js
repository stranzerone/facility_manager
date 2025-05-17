import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export const GetIssueInfo = async (uuid) => {
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

    // Payload for filtering data
    const payload = {
uuid:uuid
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
    const response = await axios.get(`${API_URL}/v3/issue/request/uuid`, {
      headers,
      params: payload, // 👈 This is the key fix
    });
    return response.data;

  } catch (error) {
    console.error('Error fetching data:', error.message || error);
    throw error;
  }
};
