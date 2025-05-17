import axios from 'axios';
import { API_URL2 } from '@env';

const validateOtp = async (id, otp) => {
  try {
    //https://api.isocietymanager.com/validateotp
    const response = await axios.post(`${API_URL2}/validateotp`, {
      id: id,
      otp: otp,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });


    // Return the response data
    return response.data; // Adjust based on the structure of the API response
  } catch (error) {
    console.error('Error validating OTP:', error);
    throw error; // Re-throw error to handle it in the calling function
  }
};

export default validateOtp;
