import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export const GetAllPmsApi = async ({ screen, asset_uuid }) => {
  try {
    const userInfo = await AsyncStorage.getItem('userInfo');


    if (!userInfo) {
      throw new Error('User information not found in AsyncStorage');
    }

    const parsedUserInfo = JSON.parse(userInfo);
    const userId = parsedUserInfo?.data?.id;
    const apiToken = parsedUserInfo?.data?.api_token;
    const societyId = parsedUserInfo?.data?.societyId;

    const headers = {
      'Content-Type': 'application/json',
      'ism-auth': JSON.stringify({
        "api-token": apiToken,
        "user-id": userId,
        "site-id": societyId,
      }),
    };
console.log("this is pms api",screen)
    // If the screen is QR, use a different endpoint and add asset_uuid to params
    if (screen === 'qr') {
      if (!asset_uuid) {
        throw new Error('Asset UUID is required for QR screen');
      }

      const params = {
        site_id: societyId,
        api_token: apiToken,
        "user-id": userId,
        'site-id': societyId,
        'api-token': apiToken,
        asset_uuid, // <-- Additional param for QR
      };

      const response = await axios.get(`${API_URL}/v3/asset/pm`, {
        params,
        headers,
        withCredentials: true,
      });
      return response.data?.data;
    }

    // Default case for all other screens
    const params = {
      site_id: societyId,
      api_token: apiToken,
      "user-id": userId,
      'site-id': societyId,
      'api-token': apiToken,
    };
    

    const response = await axios.get(`${API_URL}/v3/pm/all`, {
      params,
      headers,
      withCredentials: true,
    });

    return response.data?.data;

  } catch (error) {
    console.error('Error fetching data:', error.message || error);
    throw error;
  }
};
