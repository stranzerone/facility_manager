import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL2 } from '@env';

export const CreateComplaintApi = async (data) => {
  const userInfo = await AsyncStorage.getItem('userInfo');

  if (userInfo) {

    const parsedUserInfo = JSON.parse(userInfo);
    const userId = parsedUserInfo.data.id
    const apiToken = parsedUserInfo.data.api_token
    const societyId =parsedUserInfo.data.societyId


     const params = {
    "user-id":userId,
    "api-token":apiToken,
      
    };


// {"data": {"complaint_category": "Electricity  (बिजली की समस्या)", "complaint_category_id": "14", "created_at": "2018-02-22 20:43:15", "created_by": "2090", "disp_order": 3, "id": 3, "name": "Fan Not Working ( पंखा काम नहीं कर रहा )", "remarks": "", "society_id": 2, "unhandled": 0, "updated_at": "2021-06-22 17:33:20", "updated_by": null}, "description": "Good", "image": "https://ismdoc.s3.amazonaws.com/public/image/jpeg/2/6752ad7e0f794_wC8iIhemlulw2ll31Y0y2024120613_2c8e1809-bc2a-4dbe-ac4d-693b0aa3a462.jpeg.jpeg", "society": 4045} 
const payload ={
"complaint_type": data.category.id,
"constant_society_id": data.society,
"self_assign": data.selfAssign,
"severity": "normal",
"sub_category": data.data.name,
"sub_category_id": data.data.id,
"description":data.description,
"file":data.image,
}



    const headers = {
        'Content-Type': 'application/json',
        'ism-auth': JSON.stringify({
          "api-token": apiToken,     // Dynamic from AsyncStorage
          "user-id": userId,         // Dynamic from AsyncStorage
          "site-id":  societyId     // If siteId is not available, fallback to default
        })
      };
      // const apiUrl = 'https://api.isocietymanager.com/addComplaint';

    try {
      const response = await axios.post(`${API_URL2}/addComplaint`,payload,{ params,headers});

      return response.data


    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Throw error to handle it later
    }
  } else {
    throw new Error('User information not found in AsyncStorage');
  }
};



