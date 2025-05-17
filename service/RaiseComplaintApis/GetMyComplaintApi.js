import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL2 } from '@env';

export const GetMyComplaints = async () => {
  try {
    const userInfo = await AsyncStorage.getItem('userInfo');
    if (!userInfo) {
      throw new Error('User information not found in AsyncStorage');
    }

    const parsedUserInfo = JSON.parse(userInfo);
    const userId = parsedUserInfo.data.id;
    const apiToken = parsedUserInfo.data.api_token;

    // const apiUrl = 'https://api.isocietymanager.com/staff/mycomplaints';
    
    // Set up the query parameters
    const params = {
      all: 1,
      page_no: 1,
      per_page: 50,
      'api-token': apiToken,
      'user-id': userId,
      'api-token': apiToken,
      'user-id': userId,
    };

    const response = await axios.get(`${API_URL2}/staff/mycomplaints`, { params });
    return response.data;

  } catch (error) {
    console.error('Error fetching complaints data:', error);
    throw error; // Handle it in the calling function
  }
};
