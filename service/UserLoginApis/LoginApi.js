import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL2 } from '@env';
import { RegisterAppOneSignal } from '../OneSignalNotifications/RegisterOnesignal';


// Login API call
export const loginApi = async (user) => {
  // Construct the payload based on the presence of userId
  const payload = {
    identity: user.email,
    password: user.password,
    tenant: 0,
    ...(user.user?.user_id && { user_id: user.user.user_id }),
  };


  try {
    const { data } = await axios.post(API_URL2+'/login', payload);

    console.log(data,'this is data for login')
    if (data.message === 'Login Successful.') {
      const { role } = data.data;

      // Check authorization for specific roles
      if (
        ['groundstaff', 'admin', 'supervisor'].includes(role)
      ) {
        // Store token and user info asynchronously
        await AsyncStorage.setItem('userInfo', JSON.stringify(data));
        await RegisterAppOneSignal();
        return data; // Return the successful response
      }

      // Unauthorized access
      return {
        message: 'You are not authorized to log in. Only Admins or Staff members are allowed.',
      };
    }

    // Handle unsuccessful login attempts
    return data;
  } catch (error) {
    // Handle network or API errors
  console.error(error)
    return {
      status: 'error',
      message: error,
    };
  }
};
