import axios from 'axios';
import { API_URL2 } from '@env';

export const otpLoginApi = async (phoneNumber) => {
//https://api.isocietymanager.com/generateotp
  try {
    const response = await axios.post(`${API_URL2}/generateotp`, {
      identity: phoneNumber, // Use the phoneNumber passed to the function
      app_roles: ['admin', 'groundstaff', 'supervisor'], // Correct array syntax
    });
    return response.data; // Return the data from the response
  } catch (error) {
    console.error('OTP API Error:', error);
    throw error; // Throw the error to be caught in the calling function
  }
};
