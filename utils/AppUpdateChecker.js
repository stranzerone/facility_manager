import VersionCheck from 'react-native-version-check';
import { Platform } from 'react-native';
import {  APP_VERSION } from '@env';

/**
 * Returns true if update required, else false
 */
export const checkAppUpdate = async () => {
  try {
 const formatVersionCode = (versionName) => {
  return versionName.split('.').join('');
};

const myVersionCode = formatVersionCode(APP_VERSION);
const latestVersionName = await VersionCheck.getLatestVersion();
const playVersionCode = formatVersionCode(latestVersionName);

console.log(myVersionCode); // e.g. "214"
console.log(playVersionCode);  // e.g. "219
    // Skip update check for beta builds
    if (myVersionCode.includes('beta')) {
      console.log('Beta version running — skip update check');
      return false;
    }

    if (myVersionCode <  playVersionCode) {
      return true; // Update needed
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking app version:', error);
    return false;
  }
};

/**
 * Helper function to open store url
 */
export const redirectToPlayStore = () => {
  const storeUrl = Platform.select({
    android: 'https://play.google.com/store/apps/details?id=com.sumasamu.isocietyManagerAdmin',
    ios: 'itms-apps://itunes.apple.com/app/idXXXXXXXXX',
  });
  Linking.openURL(storeUrl);
};
