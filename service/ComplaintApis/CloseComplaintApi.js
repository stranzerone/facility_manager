import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL2 } from '@env';

export const CloseComplaintApi = async (data) => {
  const userInfo = await AsyncStorage.getItem('userInfo');

  if (userInfo) {
    const parsedUserInfo = JSON.parse(userInfo);
    const userId = parsedUserInfo.data.id;
    const apiToken = parsedUserInfo.data.api_token;
    const societyId = parsedUserInfo.data.societyId;

console.log(data,'this is received as params from prop')
    const params = {
      "user-id": userId,
      "api-token": apiToken,
    };

    const headers = {
      'Content-Type': 'application/json',
      'ism-auth': JSON.stringify({
        "api-token": apiToken,  
        "user-id": userId,     
        "site-id": societyId 
      }),
    };
    // const apiUrl = 'https://api.isocietymanager.com/staff/updatecomplaint';

    try {
      const response = await axios.put(`${API_URL2}/staff/updatecomplaint`, data, { params, headers });
      console.log(response.data,'this is resposne data')
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Throw error to handle it later
    }
  } else {
    throw new Error('User information not found in AsyncStorage');
  }
};
