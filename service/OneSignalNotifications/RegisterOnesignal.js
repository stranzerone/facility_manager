import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL2, APP_VERSION_CODE,APP_ID_ONE_SIGNAL } from '@env'; // Assuming these are set in your .env file
import { OneSignal } from 'react-native-onesignal';
export const RegisterAppOneSignal = async () => {
  try {
    // Fetch the user information from AsyncStorage
    const userInfo = await AsyncStorage.getItem('userInfo');

    if (!userInfo) {
      throw new Error('User information not found in AsyncStorage');
    }

    const parsedUserInfo = JSON.parse(userInfo);
    const userId = parsedUserInfo.data.id;
    const apiToken = parsedUserInfo.data.api_token;
    const societyId = parsedUserInfo.data.societyId;

    // Fetch OneSignal device ID
const deviceId = await OneSignal.User.pushSubscription.getIdAsync();

    const headers = {
      'Content-Type': 'application/json',
      'ism-auth': JSON.stringify({
        'api-token': apiToken, // Dynamic from AsyncStorage
        'user-id': userId,     // Dynamic from AsyncStorage
        'site-id': societyId   // Dynamic from AsyncStorage
      })
    };

    const body = {
      app_name: "ism-staff", // Fetched from .env
      app_version_code: APP_VERSION_CODE, // Fetched from .env
      app_device_id: deviceId,
      userId: deviceId,
      app_id:deviceId,
      tenant: 0
    };
    const params = {
     app_id : APP_ID_ONE_SIGNAL, 
    }

    // Make the POST request
    const response = await axios.post(`${API_URL2}/appRegistered`, body, { params,headers });
     return true

  } catch (error) {
    console.error('Error registering app:', error);
    throw error; // Throw error to handle it later
  }
};
