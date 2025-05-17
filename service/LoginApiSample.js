
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL2 } from '@env';

// Base URL for the API (replace with your actual API URL)
// const BASE_URL = 'https://api.isocietymanager.com'; // Change this to your actual API URL

// Login API call
export const loginApi = async (email, password) => {
 


  
  try {
    // Call the API
    const response = await axios.post(`${API_URL2}/login`, {
      identity: email,
      password: password,
    });
    // Debug: Log the full response to see the structure

    // Check if the response is successful (status 200)
    if (response.data.message === 'Login Successful.') {
      // Store the token and user info in AsyncStorage
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.data));
      
      // Return the entire response, not just the status
  
      return response.data;
    } else {
      // Handle other statuses (e.g., 401 unauthorized)
      return response.data
    }
  } catch (error) {
    // Axios errors contain a response object
    if (error.response) {
      console.error('API Error Response:', error.response);
    } else {
      console.error('Error Message:', error.message);
    }
    throw error; // Rethrow the error to be handled in the UI
  }
};
