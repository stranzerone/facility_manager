import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './app/Login/Login';
import ForgotPasswordScreen from './app/Login/ForgotPassword/ForgotPasswordScreen';
import MyTabs from './app/BottomTabs/BottomTabsNav';
import { StatusBar } from 'expo-status-bar';
import OtpLogin from './app/Login/OtpLogin/OtpLoginScreen';
import OtpEnterPage from './app/Login/OtpLogin/OtpEnterPage';
import { PermissionsProvider } from './app/GlobalVariables/PermissionsContext';
import FilteredWorkOrderPage from './app/WorkOrders/ScannedWorkOrderScreen';
import BuggyListTopTabs from './app/BuggyListTopTabs/BuggyListTopTabsQr';
import UpdateAppScreen from './app/TabNavigatorsWo/VersionHandler';
import CameraScreen from "./app/GlobalVariables/CameraScreen";
import RequestServiceTabs from './app/ServiceTab/RequestServiceTopTabs';
import { Platform } from 'react-native';

const Stack = createNativeStackNavigator();

export default function MainNavigation() {

  const [modalVisible, setModalVisible] = useState(true);





  return (
    <PermissionsProvider>
    <StatusBar
  barStyle="dark" // Uses the system's default text and icon color
  translucent={true} // Allows the status bar to be overlaid on the content
  backgroundColor="black" // Ensures the background blends with the app's layout
/>

      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#1996D3' },
            headerTintColor: '#FFFFFF',
          }}
        >
          <Stack.Screen 
            name="Login" 
            options={{ headerLeft: null }}
          >
            {props => <LoginScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen name="Home" component={MyTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen options={{ title:"Request OTP"}} name="OtpLogin" component={OtpLogin} />
          <Stack.Screen  options={{ title:"OTP Verification"}} name="OtpEnter" component={OtpEnterPage} />
          <Stack.Screen  options={{ title:"Camera"}} name="CameraScreen" component={CameraScreen} />
          {/* <Stack.Screen  options={{ title:"Inventory"}} name="InventoryOptionsScreen" component={InventoryOptionsScreen} />
          <Stack.Screen  options={{ title:"Issue Requests"}} name="IssuedRequests" component={IRItemsScreen} />
          <Stack.Screen  options={{ title:"New Issue Request"}} name="CreateIssueRequest" component={CreateIRScreen} />
          <Stack.Screen  options={{ title:"IR detail"}} name="IrDetail" component={IRDetailScreen} /> */}

    <Stack.Screen
    
    name="AddWoQr"
    component={RequestServiceTabs}
    options={{
      title:'',
      headerShown: false }}
  />
          <Stack.Screen
      name="ScannedWoTag"
      component={FilteredWorkOrderPage}
      options={{ headerShown: false }}
    />


<Stack.Screen
      name="ScannedWoBuggyList"
      component={BuggyListTopTabs}
      options={{ headerShown: false }}
 />

        </Stack.Navigator>
      </NavigationContainer>
        {  Platform.OS === 'android' &&  modalVisible && <UpdateAppScreen />}
    </PermissionsProvider>
  );
}
