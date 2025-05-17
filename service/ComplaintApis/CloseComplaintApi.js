import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL2 } from '@env';

export const CloseComplaintApi = async (data, otp) => {
  const userInfo = await AsyncStorage.getItem('userInfo');

  if (userInfo) {
    const parsedUserInfo = JSON.parse(userInfo);
    const userId = parsedUserInfo.data.id;
    const apiToken = parsedUserInfo.data.api_token;
    const societyId = parsedUserInfo.data.societyId;


    const params = {
      "user-id": userId,
      "api-token": apiToken,
    };


let payload
if(data.ask_otp == -1){
   payload = {
    ...data, 
    status: "Closed",
   
  };
}else{

   payload = {
    ...data, 
    status: "Closed",
    otp
  };
}


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
      const response = await axios.put(`${API_URL2}/staff/updatecomplaint`, payload, { params, headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Throw error to handle it later
    }
  } else {
    throw new Error('User information not found in AsyncStorage');
  }
};
