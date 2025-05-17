import axios from 'axios'
import {APP_ID} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// List of excluded routes (if needed)
const excludedRoutes = [];

axios.interceptors.request.use(
  async (config) => {
    // Retrieve user data from local storage
    const userInfo = await AsyncStorage.getItem('userInfo');

    const loggedInUser = JSON.parse(userInfo);
    const roleId = loggedInUser && loggedInUser.data.role_id ? loggedInUser.data.role_id : null;


    // Check if the URL is excluded
    const isExcluded = excludedRoutes.some(route => config.url.startsWith(route));

    if (!isExcluded) {
      const separator = config.url.includes('?') ? '&' : '?';
      config.url = `${config.url}${separator}group-id=${roleId}&app_id=${APP_ID}`;
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

export default axios;
