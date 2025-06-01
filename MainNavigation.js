import React, { useState,useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import LoginScreen from './app/Login/Login';
import ForgotPasswordScreen from './app/Login/ForgotPassword/ForgotPasswordScreen';
import MyTabs from './app/BottomTabs/BottomTabsNav';
import OtpLogin from './app/Login/OtpLogin/OtpLoginScreen';
import OtpEnterPage from './app/Login/OtpLogin/OtpEnterPage';
import FilteredWorkOrderPage from './app/WorkOrders/ScannedWorkOrderScreen';
import BuggyListTopTabs from './app/BuggyListTopTabs/BuggyListTopTabsQr';
import UpdateAppScreen from './app/TabNavigatorsWo/VersionHandler';
import CameraScreen from './app/GlobalVariables/CameraScreen';
import RequestServiceTabs from './app/ServiceTab/RequestServiceTopTabs';
import { PermissionsProvider, usePermissions } from './app/GlobalVariables/PermissionsContext';
import Toast from 'react-native-toast-message'; // ✅ Required
import NetInfo from '@react-native-community/netinfo';
import { syncOfflineQueue } from './offline/fileSystem/offlineSync.js';
const Stack = createNativeStackNavigator();

// Wrap navigator to use context inside
const MainNavigator = () => {
  const { nightMode } = usePermissions();
  const [modalVisible] = useState(true);
const{syncStatus,setSyncStatus,queueLength,setQueueLength,setSyncTime}  = usePermissions()

  const MyDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#121212',
    },
  };

  const MyLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#ffffff',
    },
  };


  useEffect(() => {
    let syncInProgress = false;
    let previousIsConnected = false;

    const unsubscribe = NetInfo.addEventListener(state => {
      const isNowOnline = state.isConnected;
       
      // Only trigger sync if coming online and not already syncing
      if (isNowOnline && !previousIsConnected && !syncInProgress) {
        syncInProgress = true;
        setSyncStatus(true)
 const now = new Date();
const formattedTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
setSyncTime(formattedTime);
        //  setSyncStarted(true)
        setTimeout(async () => {
          try {
            setSyncStatus(true)
            await syncOfflineQueue(queueLength,setQueueLength);
            // setSyncStarted(false)
            Toast.show({
              type: 'success',
              text1: 'Sync Complete',
              text2: 'All offline data synced successfully.',
              position: 'top',
            });
          } catch (err) {
            Toast.show({
              type: 'error',
              text1: 'Sync Failed',
              text2: 'Some offline data could not be synced.',
              position: 'top',
            });
          } finally {
  syncInProgress = false;
  setTimeout(() => {
    setSyncStatus(false);
  }, 12000);
}

        }, 5000); // Wait 5 seconds before syncing
      }

      previousIsConnected = isNowOnline;
    });

    return () => unsubscribe();
  }, []);


  return (
    <>
      <StatusBar
        style={nightMode ? 'light' : 'dark'}
        translucent={true}
        backgroundColor={nightMode ? '#121212' : '#ffffff'}
      />
      <NavigationContainer theme={nightMode ? MyDarkTheme : MyLightTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#1996D3' },
            headerTintColor: '#FFFFFF',
          }}
        >
          <Stack.Screen name="Login" options={{ headerLeft: null }}>
            {(props) => <LoginScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen name="Home" component={MyTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="OtpLogin" component={OtpLogin} options={{ title: 'Request OTP' }} />
          <Stack.Screen name="OtpEnter" component={OtpEnterPage} options={{ title: 'OTP Verification' }} />
          <Stack.Screen name="CameraScreen" component={CameraScreen} options={{ title: 'Camera' }} />

          <Stack.Screen name="AddWoQr" component={RequestServiceTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ScannedWoTag" component={FilteredWorkOrderPage} options={{ headerShown: false }} />
          <Stack.Screen name="ScannedWoBuggyList" component={BuggyListTopTabs} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>

      {Platform.OS === 'android' && modalVisible && <UpdateAppScreen />}
    </>
  );
};

// Export wrapped in PermissionsProvider
export default function MainNavigation() {
  return (
    <PermissionsProvider>
      <MainNavigator />
    </PermissionsProvider>
  );
}
