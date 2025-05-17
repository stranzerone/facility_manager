import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '@env';




export const WorkOrderInfoApi = async (WoUuId) => {
  // Retrieve user information from AsyncStorage
  const userInfo = await AsyncStorage.getItem('userInfo');

  const parsedUserInfo = JSON.parse(userInfo);

 


  if (userInfo) {
    const userId = parsedUserInfo.data.id
    const apiToken = parsedUserInfo.data.api_token
    const societyId =parsedUserInfo.data.societyId

    
    // Define the API endpoint

    // Prepare the parameters for the API request
    const params = {
   
    
      uuid:WoUuId,
      site_id: societyId,
      'api-token': apiToken,
      'user-id ':userId,
      'api-token': apiToken,
     'user-id ':userId,
    };
    // const apiUrl = 'https://nppm-api.isocietymanager.com/v4/workorder';

    try {
      // Make the API request using axios
      const response = await axios.get(`${API_URL}/v4/workorder`, { params});
      if(response){
        return response.data.data
      }

      // Log the count of metadata for debugging
    
    } catch (error) {
      console.error('Error fetching mm', error);
    }
  } 
};
