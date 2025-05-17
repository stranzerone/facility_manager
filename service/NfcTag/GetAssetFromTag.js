import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';



export default GetAssetForTag = async () => {
 
  try {
    const userInfo = await AsyncStorage.getItem('userInfo');
   

    if (userInfo) {
      const parsedUserInfo = JSON.parse(userInfo);
      const userId = parsedUserInfo.data.id;
      const apiToken = parsedUserInfo.data.api_token;
      const societyId = parsedUserInfo.data.societyId;

      // const apiUrl = `https://nppm-api.isocietymanager.com/v3/resource/assetorlocation`;

      const params = {
        "api-token": apiToken,
        "user-id": userId,
        "site-id": societyId,
        site_id:societyId,
        nfc_tag:'1d7fe92a051080'
          };

      const response = await axios.get(`${API_URL}/v3/resource/assetorlocation`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params,
        withCredentials: true,
      });


     if(response.data.status =='success'){
        console.log("navigation created")

     }

      return response.data;
    } else {
      console.error("User info not found in AsyncStorage");
      throw new Error("User info not found");
    }
  } catch (error) {
    throw error;
  }
};
