import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL2,APP_ID,APP_VERSION_CODE} from "@env";



export default GetAppUdatesApi = async () => {
 
  try {
    const userInfo = await AsyncStorage.getItem('userInfo');
   

    if (userInfo) {
      const parsedUserInfo = JSON.parse(userInfo);
      const userId = parsedUserInfo.data.id;
      const apiToken = parsedUserInfo.data.api_token;


      const params = {
        code:"factech_tech_android",
         version_code: APP_VERSION_CODE,
         "api-token":apiToken,
         "user-id": userId,
          app_id:APP_ID
          };

      const response = await axios.get(`${API_URL2}/appversion`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params,
        withCredentials: true,
      });

   return response.data

 
    } else {
      throw new Error("User info not found");
    }
  } catch (error) {
    throw error;
  }
};
