import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export const CreateIssueRequestApi = async (itemsData,itemList) => {
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
    // itemsData.warehouse_id = "768534e1-b0df-49fa-93c5-a842806d5d29";
    itemsData.site_uuid = siteUuid;
    itemsData.created_by = userId;

const payload ={
...itemsData,
line_items:itemList,
user_id:userId
}


    const headers = {
      'Content-Type': 'application/json',
      'ism-auth': JSON.stringify({
        "api-token": apiToken,
        "user-id": userId,
        "site-id": societyId,
      }),
    };


    const response = await axios.post(`${API_URL}/v3/stock/request`, payload, { headers });
    return response.data;
  } catch (error) {
    console.error('Error submitting IR request:', error.message || error);
    throw error;
  }
};
