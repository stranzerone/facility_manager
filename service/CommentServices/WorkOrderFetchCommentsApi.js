import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '@env';


export const WorkOrderComments = async (WoUuId,selectedButton) => {
  const userInfo = await AsyncStorage.getItem('userInfo');
  const parsedUserInfo = JSON.parse(userInfo);

 


  if (userInfo) {
    const userId = parsedUserInfo.data.id
    const apiToken = parsedUserInfo.data.api_token
    const societyId =parsedUserInfo.data.societyId

    const params = {
 
      ref_uuid:WoUuId,
      type:"WO",
      order:"desc",
      page_no:1,
      per_page:100,
      'api-token': apiToken,
      'user-id':userId,
      'api-token': apiToken,
      'user-id':userId,
      
    };

    if(selectedButton !== "all"){
params.tag = selectedButton
    }
      



    const headers = {
      'Content-Type': 'application/json',
      'ism-auth': JSON.stringify({
        "api-token": apiToken,     // Dynamic from AsyncStorage
        "user-id": userId,         // Dynamic from AsyncStorage
        "site-id":  societyId     // If siteId is not available, fallback to default
      })
    };


    // const apiUrl = 'https://nppm-api.isocietymanager.com/v3/comments?';

    try {
      const response = await axios.get(`${API_URL}/v3/comments?`, { params,headers,withCredentials:true});
      const data = response.data.data

  if(response.data != null){
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



