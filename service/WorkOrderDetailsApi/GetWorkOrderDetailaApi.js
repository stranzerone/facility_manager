import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export const GetInstructionsApi = async () => {
  const userInfo = await AsyncStorage.getItem('userInfo');
  const uuid = await AsyncStorage.getItem('uuid');

  if (userInfo) {

const parsedUserInfo = JSON.parse(userInfo);
const userId = parsedUserInfo.data.userId;
const apiToken = parsedUserInfo.data.api_token
const societyId =parsedUserInfo.data.societyId

    // const apiUrl = 'https://nppm-api.isocietymanager.com/v3/insts';

    const params = {
        ref_uuid:uuid,
        ref_type:"WO"
      
    };


    const headers = {
        'Content-Type': 'application/json',
        'ism-auth': JSON.stringify({
          "api-token": apiToken,    
          "user-id": userId,        
          "site-id":  societyId    
        })
      };



    try {
      const response = await axios.get(`${API_URL}/v3/insts`, { params,headers, withCredentials: true });
      const data = response.data.data


  if(response.data.metadata.count){
    return data; // Return the relevant data

  }else{
    return  false
  }

    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Throw error to handle it later
    }
  } else {
    throw new Error('User information not found in AsyncStorage');
  }
};



