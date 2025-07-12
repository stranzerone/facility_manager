// import '../../utils/AxiosInterceptor/axiosIntercepter' 
import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Alert, Text, View, StyleSheet, Platform,useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import NewScanPage from '../QrScanner/NewScanPage';
import WorkOrderHomeTab from '../TabNavigatorsWo/WoTabsNavigators';
import DashboardOptionScreen from "../WorkOrderStack/WoHomeTab"
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBellConcierge, faList, faQrcode, faBell, faPager, faFileLines, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
import { usePermissions } from '../GlobalVariables/PermissionsContext'; // Use your PermissionsContext
import NotificationMainPage from '../Notification/NotificationScreen';
import ComplaintDropdown from '../RaiseComplaint/ComplaintDropdown';
import ComplaintsScreen from '../MyComplaints/ComplaintsScreen';
import RequestServiceTabs from '../ServiceTab/RequestServiceTopTabs';
import ComplaintCloseScreen from '../MyComplaints/CloseComplaint';
import SubComplaint from '../RaiseComplaint/SubComplaintItem';
import NewComplaintPage from '../RaiseComplaint/CompaintInput';
import { useDispatch, useSelector } from 'react-redux';
import FilteredWorkOrderPage from '../WorkOrders/ScannedWorkOrder';
import BuggyListTopTabs from '../BuggyListTopTabs/BuggyListTopTabs';
import { Image } from 'react-native'; 
import { clearAllTeams, fetchAllTeams } from '../../utils/Slices/TeamSlice';
import { clearAllUsers, fetchAllUsers } from '../../utils/Slices/UsersSlice';
import { Keyboard } from 'react-native';
import IRItemsScreen from '../Inventory/IR/IssueRequestScreen';
import CreateIRScreen from '../Inventory/IR/RaiseIssueRequest';
import InventoryOptionsScreen from '../Inventory/InventoryMainScreen';
import IRDetailScreen from '../Inventory/IR/IRItemInfo';
import WorkOrderPage from '../WorkOrders/WorkOrderScreen';
import UpcomingWorkOrdersScreen from '../WorkOrders/FutureWoScreen';
import useNfcTagHandler from '../../utils/GlobalFunctions/NfcTagHandler';
import { workOrderService } from '../../services/apis/workorderApis';
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const WorkOrderStack = () => (
  <Stack.Navigator>
        <Stack.Screen
      name="DashboardOptionScreen"
      component={DashboardOptionScreen}
      options={{ headerShown: false }}
    />
    
    <Stack.Screen
      name="WorkOrderHomeTab"
      component={WorkOrderHomeTab}
      options={{ headerShown: false }}
    />
    
    <Stack.Screen
      name="FutureWorkOrders"
      component={UpcomingWorkOrdersScreen}
      options={{ headerShown: false }}
    />
        <Stack.Screen
      name="MyWorkOrders"
      component={WorkOrderPage}
      options={{ headerShown: false }}
    />

  <Stack.Screen 
  name="AddWo"
  component={RequestServiceTabs}
  options={{
    title: 'Create WO',
    headerShown: false,
    headerStyle: {
      height: 40,  // Adjust height as needed
    },
    headerTitleStyle: {
      fontSize: 18,  // You can also adjust the title font size if needed
    },
  }}
/>

<Stack.Screen 
  name="BuggyListTopTabs"
  component={BuggyListTopTabs }
  options={{
    title: 'Instructions',
    headerShown:true,
    headerStyle: {
      height: 40,  // Adjust height as needed
    },
    headerTitleStyle: {
      fontSize: 18,  // You can also adjust the title font size if needed
    },
  }}
/>

  </Stack.Navigator>
);

const QRCodeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
    
      name="NewScanPage"
      component={NewScanPage}
      options={{
        title:'',
        headerShown: false }}
        
    />
              <Stack.Screen  options={{ title:"Inventory"}} name="InventoryOptionsScreen" component={InventoryOptionsScreen} />
              <Stack.Screen  options={{ headerShown:false}} name="IssuedRequests" component={IRItemsScreen} />
              <Stack.Screen  options={{ title:"New Issue Request"}} name="CreateIssueRequest" component={CreateIRScreen} />
              <Stack.Screen  options={{ title:"IR detail"}} name="IrDetail" component={IRDetailScreen} />
    
      {/* <Stack.Screen
    
    name="AddWoQr"
    component={RequestServiceTabs}
    options={{
      title:'',
      headerShown: false }}
  /> */}



<Stack.Screen
      name="ScannedWo"
      component={FilteredWorkOrderPage}
      options={{ headerShown: false }}
    />

<Stack.Screen
      name="ScannedWoInsturctions"
      component={BuggyListTopTabs}
      options={{ headerShown: false }}
    />


  </Stack.Navigator>
);



const ServiceRequestStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Service Request"
      component={ComplaintsScreen}
      options={{ 
      
        headerShown: false }}
    />
     <Stack.Screen 
          name="subComplaint"
          component={SubComplaint} 
          options={{ title: 'Sub Category', headerShown: true }}

          />
          <Stack.Screen 
           name="complaintInput"
           component={NewComplaintPage}
           options={{ title: 'Add service request', headerShown: true }}
           />
          <Stack.Screen
          options={{title:'Service request details'}}
          name="CloseComplaint" component={ComplaintCloseScreen} />
          <Stack.Screen 
          name="RaiseComplaint"
           component={ComplaintDropdown} 
           options={{ title: 'Select Category', headerShown: true }}

           />
  </Stack.Navigator>
);

const MyTabs = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState(); // Initialize notification count
 const [dispatchCount,setDispatchCount]  =useState(0)
  const navigation = useNavigation();
  const { setPpmAsstPermissions,notificationsCount,setIssueRequestPermission,setComplaintPermissions,setInstructionPermissions,setPpmWorkorder} = usePermissions(); // Extract context permissions function
  const [user,setUser] = useState({})
  const [siteLogo,setSiteLogo]  = useState(null)
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
   const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const dispatch = useDispatch();
  useEffect(() => {
    const loadPermissions = async () => {

      try {
        
        const savedPermissions = await AsyncStorage.getItem('userInfo');
        // const societyString = await AsyncStorage.getItem('society');
        
        // const societyData = JSON.parse(societyString);
        // setSiteLogo(societyData.logo)
        if (savedPermissions) {
          const userInfo = JSON.parse(savedPermissions); // Parse the stored string into an object
        
        // console.log(userInfo.data.society.name,"this is userinfo in bottomTabs")
          setUser(userInfo.data.society)

          
          // Check if permissions exist in the userInfo object
          if (userInfo.data && userInfo.data.permissions) {
            // Filter permissions that start with 'PPMASST'
            const filteredPermissions = userInfo.data.permissions
              .filter(item => item.startsWith('PPM_WOV.')) // Get items starting with 'PPMASST'
              .map(item => item.split('.')[1]); // Split at the first dot and take the second part
            
              setPpmAsstPermissions(filteredPermissions); // Set permissions in context



              const filteredInventoryIssueRequest = userInfo.data.permissions
              .filter(item => item.startsWith('INV_IRQ.')) // Get items starting with 'PPMASST'
              .map(item => item.split('.')[1]); // Split at the first dot and take the second part
            

              setIssueRequestPermission(filteredInventoryIssueRequest)



              const filteredPpmWorkorderPermissions = userInfo.data.permissions
              .filter(item => item.startsWith('PPM_WRK.')) // Get items starting with 'PPMASST'
              .map(item => item.split('.')[1]); // Split at the first dot and take the second part
            

              setPpmWorkorder(filteredPpmWorkorderPermissions)

              const filteredComplaintPermissions = userInfo.data.permissions
              .filter(item => item.startsWith('COM.')) // Get items starting with 'PPMASST'
              .map(item => item.split('.')[1]); // Split at the first dot and take the second part
            
              setComplaintPermissions(filteredComplaintPermissions); // Set permissions in context
         
         
              const filteredInstructionPermissions = userInfo.data.permissions
              .filter(item => item.startsWith('PPM_IST.')) // Get items starting with 'PPMASST'
              .map(item => item.split('.')[1]); // Split at the first dot and take the second part
            
              setInstructionPermissions(filteredInstructionPermissions); // Set permissions in context

            }
        }
      } catch (error) {
        console.error("Failed to load permissions:", error);
      }
    };



    loadPermissions(); // Call the function on mount




  }, []); // Dependency array includes setPpmAsstPermissions
  const users = useSelector((state) => state.users.data);
  const teams = useSelector((state) => state.teams.data);

  useEffect(() => {
    // Define the fetchLogo function inside useEffect
const StoreSociety = async() =>{

  try {
    await workOrderService.getSiteInfo()
    await workOrderService.getStatuesUuid()
  } catch (error) {
    console.error('Error fetching society data:', error);
  }
}

    const fetchLogo = async () => {
      try {
        const societyString = await AsyncStorage.getItem('userInfo');
       
        if (societyString) {
          const societyData = JSON.parse(societyString); // Parse the data
          const parsedImages = JSON.parse(societyData.data.society.data)
          setSiteLogo(parsedImages.logo); // Set the logo URL
        } else {
          console.log('No society data found.');
        }
      } catch (error) {
        console.error('Error fetching society data:', error);
      }
    };

    fetchLogo(); // Call the function to fetch logo
    StoreSociety()
    console.log(users.length,teams.length,"this is lengt")
    if (!users?.length || !teams?.length) {
      console.log("dispatching users and teams")
      dispatch(fetchAllTeams());
      dispatch(fetchAllUsers());
    }
  }, []); // Empty dependency array ensures this runs once when the component mounts






  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  const fetchTotalNotifications = async () => {
    try {
      const response = notificationsCount; // Call your API to get notifications
      setTotalNotifications(response || 0); // Update the state with the total notifications count
    } catch (error) {
      console.error("Error fetching notifications count:", error);
    }
  };
  useEffect(() => {
    // Fetch notifications initially
    fetchTotalNotifications();
 

  
    // Optional: setInterval for polling every 10 minutes (if needed)
  }, []);
  

  
  useNfcTagHandler({setPopupVisible,setPopupMessage,setPopupType}) // NFC logic moved here



  const handleLogout = async () => {
    try {
      await workOrderService.appUnrigester()
      await AsyncStorage.removeItem('userInfo');
      await dispatch(clearAllTeams())
 
      await dispatch(clearAllUsers())
      navigation.replace("Login");

    } catch (error) {
      console.error('Error clearing local storage', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };
  const renderLogoutButton = () => (
    <View
      className="flex flex-row h-20 p-4 rounded-lg shadow-md gap-4 items-center"
    >
      {/* <View className="bg-slate-700 p-2 rounded-lg">
        {Platform.OS === "android" && ( // Conditionally render society name for Android
          <Text className="h-5 text-center text-sm text-white font-semibold px-0">
            {user?.name}
          </Text>
        )}
      </View> */}
  
      {/* Power-off icon (only clickable) */}
      <TouchableOpacity 
       
        onPress={() => setModalVisible(true)} // Open confirmation popup

        className="bg-red-600 p-2 rounded-full"
      >
        <Icon name="power-off" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
  
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <StatusBar
      barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      backgroundColor={colorScheme === 'dark' ? '#000' : '#FFF'} // Set background color
      translucent={false}
    />

      {/* Dynamic Popup for logout confirmation */}
      <DynamicPopup
        visible={modalVisible}
        type="warning"
        message="You will be logged out. Are you sure you want to log out?"
        onClose={() => setModalVisible(false)}
        onOk={() => {
          setModalVisible(false);
          handleLogout();
        }}
      />

          <DynamicPopup
          visible={popupVisible}
          type={popupType}
          message={popupMessage}
          onClose={() => setPopupVisible(false)}
          onOk={() => {
            setPopupVisible(false);
          }} />
      

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown:true,
          tabBarHideOnKeyboard:true,
          tabBarStyle: {
            position: 'absolute',
            display:isKeyboardVisible ? 'none' : 'flex',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#1996D3',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: Platform.OS === 'android' ? null : 10,
            height: Platform.OS === 'android' ? 60 : 70,
            ...styles.shadow,
            elevation: 5,
          },
          
          headerRight: renderLogoutButton,
          headerLeft: () => (
      <View className="flex flex-row border-1 h-12 justify-start rounded-r-md gap-1 items-start" style={styles.logoContainer}>
{siteLogo &&
  <Image
  className="h-32 w-24"
  source={{ uri: siteLogo }}
  style={[styles.logo, { borderRadius: 48, overflow: 'hidden' }]} 
  resizeMode="contain"
/>

        }
  {/* {Platform.OS === "android" && ( // Conditionally render society name for Android
    <Text className="h-5 text-center text-sm text-white font-black px-0">
      {user?.name?.length > 12 ? `${user.name.substring(0, 12)}...` : user?.name}
    </Text>
  )} */}
</View>

          ),
          

          headerStyle: { backgroundColor: '#1996D3' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold', // Make text bold
          },
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => {
            let icon;

            if (route.name === 'Work Orders') {
              icon = faList;
            } else if (route.name === 'QRCode') {
              icon = faQrcode;
            } else if (route.name === 'ServiceRequests') {
              icon = faBellConcierge;
            } else if (route.name === 'Notifications') {
              icon = faBell;
           } else if (route.name === 'MyComplaints') {
              icon = faFileAlt;
            }

            //MyComplaints
            return (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <FontAwesomeIcon icon={icon} size={24} color={"#FFFFFF"} />
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Work Orders" options={{ title: 'Work Orders' ,headerShown: true, }} component={WorkOrderStack} />
        {/* <Tab.Screen name="MyComplaints" options={{ title: 'Complaints' }} component={ComplaintsScreen} /> */}

        <Tab.Screen name="QRCode" options={{ title: 'QR Scan', headerShown: true,   unmountOnBlur: true }} component={QRCodeStack} />
        <Tab.Screen name="ServiceRequests" options={{ title: 'Service Request', headerShown: true, }} component={ServiceRequestStack} />

        <Tab.Screen 
          name="Notifications"
                    // component={IRItemsScreen}
 
          component={NotificationMainPage}
          options={{
            title:'Notifications',
            headerShown: true,
          }}
          
       
        />
      </Tab.Navigator>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoutButton: {
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
  societyNameContainer: {
    marginLeft: 15,
  },
  societyNameText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  logoContainer: {
    height:50,
    justifyContent: "start",
    paddingHorizontal: 10,
    width: "80%",
    alignItems: "center",
  },
  
  logo: {
    maxWidth: 80,
    maxHeight: 45,
    borderRadius: 5,

},
  activeIconContainer: {
    backgroundColor: '#074B7C',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
});

export default MyTabs;
