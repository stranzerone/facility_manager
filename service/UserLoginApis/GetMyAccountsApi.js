import axios from 'axios';
import { API_URL2 } from '@env';

export const GetMyAccounts = async (token) => {
  // const baseUrl = 'https://api.isocietymanager.com/getmyaccounts';

  try {
    // Base URL

    // Construct the request URL with query parameters
    const requestUrl = `${API_URL2}/getmyaccounts?token=${token}`;
    // Make the GET request
    const response = await axios.get(requestUrl);
    return response.data; // Return the data from the response
  } catch (error) {
    // Handle error
    console.error('Error fetching accounts:', error);
    throw error; // Re-throw the error for further handling
  }
};
