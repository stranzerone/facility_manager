import React, { useState } from 'react';
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

const Stack = createNativeStackNavigator();

// Wrap navigator to use context inside
const MainNavigator = () => {
  const { nightMode } = usePermissions();
  const [modalVisible] = useState(true);

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
