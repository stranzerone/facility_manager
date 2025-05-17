import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from "@env";


export default GetUuIdForTag = async (id) => {
  try {
    const userInfo = await AsyncStorage.getItem('userInfo');
   

    if (userInfo) {
      const parsedUserInfo = JSON.parse(userInfo);
      const userId = parsedUserInfo.data.id;
      const apiToken = parsedUserInfo.data.api_token;
      const societyId = parsedUserInfo.data.societyId;

      // const apiUrl = `https://nppm-api.isocietymanager.com/v3/resource/assetorlocation?site_id=2&&nfc_tag=${id}`;

      const params = {
        "api-token": apiToken,
        "user-id": userId,
        "site-id": societyId,
        "site_id"  : societyId,
        "nfc_tag"  : id
          };

      const response = await axios.get(`${API_URL}/v3/resource/assetorlocation`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params,
        withCredentials: true,
      });
      // console.log(response.data.data[0],"response for tag id passed")

  //  console.log(response.data.data[0]._LABELS.includes('LOCATION'),"response for tag id passed")

    //  if(response.data.status =='success'){
    //     console.log("navigation created")

    //  }
    console.log(response.data,'for tag')

      return response.data;
    } else {
      console.error("User info not found in AsyncStorage");
      throw new Error("User info not found");
    }
  } catch (error) {
    console.log(error,"error at get uuid from nfc")
    throw error;
  }
};
