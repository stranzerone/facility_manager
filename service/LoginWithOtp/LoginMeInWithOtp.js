import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL2 } from '@env';

export const LogMeInWithOtp = async (data) => {
  // const baseUrl = 'https://api.isocietymanager.com/logmein';

  // Construct the payload properly
  const payload = {
    user_id: data.data.user_id,
    name: data.data.name, // Correcting the 'dataname' to 'name'
    society_name: data.data.society_name,
    society_id: data.data.society_id,
    flat_no: data.data.flat_no, // Correcting this to match data.data
    display_unit_no: data.data.display_unit_no,
    role: data.data.role,
    designation_name: data.data.designation_name,
    activated: data.data.activated
  };


  try {
    // Construct the request URL with query parameters
    const requestUrl = `${API_URL2}/logmein?token=${data.token}`;

    // Make the POST request
    const response = await axios.post(requestUrl, payload);

    // Log the entire response for debugging

    // Check for a successful status in the response
    if (response.data.status === 'success') {
      // Store the token and user info in AsyncStorage
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.data));

      // Return the successful response data
      return response.data;
    } else {
      // Handle unsuccessful login attempts (return full response for more details)
      return {
        status: 'error',
        message: response.data.message || 'Login failed, please check your details.'
      };
    }
  } catch (error) {
    // Handle error and return it instead of re-throwing it
    console.error('Error during login with OTP:', error.response || error.message);
    
    // Return structured error message
    return {
      status: 'error',
      message: error.response ? error.response.data.message : error.message
    };
  }
};
