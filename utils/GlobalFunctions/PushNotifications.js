// Include the OneSignal package
import { OneSignal, LogLevel } from 'react-native-onesignal';
import { APP_ID_ONE_SIGNAL } from '@env';
const getOneSignalId = async () => {
  try {
    const id = await OneSignal.User.getOnesignalId();
    console.log('OneSignal ID:', id);
  } catch (error) {
    console.error('Error getting OneSignal ID:', error);
  }
};

// Example to get External ID
const getExternalId = async () => {
  try {
    const id = await OneSignal.User.getExternalId();
    console.log('External ID:', id);
  } catch (error) {
    console.error('Error getting External ID:', error);
  }
};

// Example to get Push Subscription ID and Token
const getPushId = async () => {
  try {
    const id = await OneSignal.User.pushSubscription.getIdAsync();
    const token = await OneSignal.User.pushSubscription.getTokenAsync();
    console.log('Push Subscription ID:', id, 'Token:', token);
  } catch (error) {
    console.error('Error getting Push ID:', error);
  }
};

const onesignalInitalize = async () => {
  // Set log level for debugging

  // Initialize with your OneSignal App ID
  OneSignal.initialize(APP_ID_ONE_SIGNAL);

  // Request push notification permission
  await OneSignal.Notifications.requestPermission(false);
  
  // Get Push ID and Token
  await getPushId();

  // Log in with a user ID (example: "2165")
  OneSignal.login("2165");
  

  // Get OneSignal ID and External ID
  await getOneSignalId();
  await getExternalId();
  OneSignal.SetLogLevel(OneSignal.LOG_LEVEL.DEBUG, OneSignal.LOG_LEVEL.DEBUG);

  // Check notification permissions (optional)
  const permissionStatus = await OneSignal.Notifications.getPermissionAsync();
  console.log('Notification Permission Status:', permissionStatus);
};

export default onesignalInitalize;
