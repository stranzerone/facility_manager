import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@env';

const GetAssets = async (text) => {
  try {
    // Fetch user information from AsyncStorage
    const userInfo = await AsyncStorage.getItem('userInfo');
    
    // Check if userInfo exists before proceeding
    if (!userInfo) {
      throw new Error("User info not found");
    }

    // Parse the user info to get required data
    const parsedUserInfo = JSON.parse(userInfo);

    // Extract userId and apiToken from parsed user info
    const userId = parsedUserInfo.data.id;
    const apiToken = parsedUserInfo.data.api_token;
    const societyId =parsedUserInfo.data.societyId

    // Set up the headers for the API request
    const headers = {
      'Content-Type': 'application/json',
      'ism-auth': JSON.stringify({
        "api-token": apiToken,
        "user-id": userId,
        "site-id": societyId
      })
    };

    // Set up the parameters for the API request
    const params = {
      site_id: societyId, // Using site_id directly
      str: text, // Empty string to fetch all assets
    };

    // Set up the base URL for the API request
    // const baseUrl = "https://nppm-api.isocietymanager.com/v3/asset/search";

    // Make the API request using axios
    const response = await axios.get(`${API_URL}/v3/asset/search?`, { params, headers });
    // Return the API response data
    return response.data;
  
  } catch (error) {
    // Log any errors that occur during the API request
    console.error("Error fetching assets:", error.message || error);
    throw error;
  }
};

export default GetAssets;
