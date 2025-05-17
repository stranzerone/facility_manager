import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL2 } from '@env';

export const GetComplaintComments = async (id) => {
  const userInfo = await AsyncStorage.getItem('userInfo');
  const uuid = await AsyncStorage.getItem('uuid');

  if (userInfo) {

const parsedUserInfo = JSON.parse(userInfo);

const userId = parsedUserInfo.data.id;
const apiToken = parsedUserInfo.data.api_token


//https://api.isocietymanager.com/staff/comment/1923296
    // const apiUrl = `https://api.isocietymanager.com/staff/comment/${id}`;

    const params = {
        ref_uuid:uuid,
        ref_type:"WO",
        'api-token': apiToken,
        'user-id': userId,
        'api-token': apiToken,
        'user-id': userId,
      
    };


    // const headers = {
    //     'Content-Type': 'application/json',
    //     'ism-auth': JSON.stringify({
    //       "api-token": apiToken,    
    //       "user-id": userId,        
    //       "site-id":  2    
    //     })
    //   };



    try {
      const response = await axios.get(`${API_URL2}/staff/comment/${id}`, { params, withCredentials: true });
      const data = response.data


    return data; // Return the relevant data


    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Throw error to handle it later
    }
  } else {
    throw new Error('User information not found in AsyncStorage');
  }
};



