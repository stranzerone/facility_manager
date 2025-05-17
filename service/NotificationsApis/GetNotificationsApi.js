import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL2 } from '@env';

export const GetNotificationsApi = async (page = 1) => {
  try {
    const userInfo = await AsyncStorage.getItem('userInfo');
    let getOldNotifications = await AsyncStorage.getItem('oldNotifications');
    let getNewNotifications = await AsyncStorage.getItem('newNotifications');

    // Initialize notifications if not set
    if (!getNewNotifications) {
      await AsyncStorage.setItem('newNotifications', '0');
      getNewNotifications = '0';
    }

    if (!getOldNotifications) {
      await AsyncStorage.setItem('oldNotifications', '0');
      getOldNotifications = '0';
    }

    if (userInfo) {
      const parsedUserInfo = JSON.parse(userInfo);
      const userId = parsedUserInfo.data.id;
      const apiToken = parsedUserInfo.data.api_token;
      const societyId = parsedUserInfo.data.societyId;

      // const apiUrl = 'https://api.isocietymanager.com/getmynotifications';

      const params = {
        "api-token": apiToken,
        "user-id": userId,
        "site-id": societyId,
        "per_page": 100,
        "page_no": page,
      };

      const response = await axios.get(`${API_URL2}/getmynotifications`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params,
        withCredentials: true,
      });

      const data = response.data;
      if (data) {
        const fetchedTotal = data.data.length;

        if (fetchedTotal > getOldNotifications) {
          const newCount = fetchedTotal - getOldNotifications;
          const newNotificationsCount = getNewNotifications ? parseInt(getNewNotifications, 10) + newCount : newCount;
          await AsyncStorage.setItem('newNotifications', newNotificationsCount.toString());
          await AsyncStorage.setItem('oldNotifications', fetchedTotal.toString());
        }
      }

      return data;
    } else {
      console.error("User info not found in AsyncStorage");
      throw new Error("User info not found");
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};
