import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export const UpdateInstructionApi = async (data) => {

  // Fetch user info from AsyncStorage
  const userInfo = await AsyncStorage.getItem('userInfo');
  const parsedUserInfo = JSON.parse(userInfo);
  if (userInfo) {
    const userId = parsedUserInfo.data.id;
    const apiToken = parsedUserInfo.data.api_token
    const societyId =parsedUserInfo.data.societyId

    // Make sure your params are set correctly


   
    // Construct the payload correctly
  

    // if(type == "image/jpeg"){
    //    payload = {
    //     id: id,      // Ensure this is the correct field your API expects
    //     result: value ,// Ensure this is the correct field your API expects
    //     remarks:remark
    //   }
    // }  
    //  else if(type == "application/pdf"){
     
    //   payload = {
    //     id: id,      // Ensure this is the correct field your API expects
    //     result: value ,// Ensure this is the correct field your API expects
    //     remarks:remark
    //   }
    // }
    
 
   const   payload = {
        id: data.id,      // Ensure this is the correct field your API expects
        result: data.value ,// Ensure this is the correct field your API expects
        remarks:data.remarks
      };
    

    const headers = {
      'Content-Type': 'application/json',
      'ism-auth': JSON.stringify({
        "api-token": apiToken, // Dynamic from AsyncStorage
        "user-id": userId,     // Dynamic from AsyncStorage
        "site-id": societyId           // If siteId is not available, fallback to default
      })
    };
    // const apiUrl = 'https://nppm-api.isocietymanager.com/v3/inst';

    try {
      // Send the PUT request
      const response = await axios.put(`${API_URL}/v3/inst`, payload, {  headers, withCredentials: true });
      // Check if the response is as expected
      if (response.data.status === 'success') {

        return true; // Return success
      } else {

        console.error('API response status was not success:', response.data);
        return false; // Return failure
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Throw error to handle it later
    }
  } else {
    throw new Error('User information not found in AsyncStorage');
  }
};
