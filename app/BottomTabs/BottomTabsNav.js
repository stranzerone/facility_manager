import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  StatusBar,
  Alert,
  Text,
  Keyboard,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faHome, 
  faFileAlt, 
  faQrcode, 
  faBell, 
  faEllipsisH 
} from '@fortawesome/free-solid-svg-icons';
import NetInfo from '@react-native-community/netinfo';

// Screens & Components
import Header from './Header';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
import useNfcTagHandler from '../../utils/GlobalFunctions/NfcTagHandler';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

// Redux
import { clearAllTeams, fetchAllTeams } from '../../utils/Slices/TeamSlice';
import { clearAllUsers, fetchAllUsers } from '../../utils/Slices/UsersSlice';
import { workOrderService } from '../../services/apis/workorderApis';

// Tabs
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// --- Home Stack ---
import WorkOrderHomeTab from '../TabNavigatorsWo/WoTabsNavigators';
import DashboardOptionScreen from '../WorkOrderStack/WoHomeTab';
import NewScanPage from '../QrScanner/NewScanPage';
import UpcomingWorkOrdersScreen from '../WorkOrders/FutureWoScreen';
import WorkOrderPage from '../WorkOrders/WorkOrderScreen';
import RequestServiceTabs from '../ServiceTab/RequestServiceTopTabs';
import BuggyListTopTabs from '../BuggyListTopTabs/BuggyListTopTabs';

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardOptionScreen" component={DashboardOptionScreen} />
    <Stack.Screen name="WorkOrderHomeTab" component={WorkOrderHomeTab} />
    <Stack.Screen name="FutureWorkOrders" component={UpcomingWorkOrdersScreen} />
    <Stack.Screen name="MyWorkOrders" component={WorkOrderPage} />
    <Stack.Screen name="AddWo" component={RequestServiceTabs} />
    <Stack.Screen name="BuggyListTopTabs" component={BuggyListTopTabs} />
    <Stack.Screen name="NewScanPageWo" component={NewScanPage} />
  </Stack.Navigator>
);

// --- QR Code Stack ---
import InventoryOptionsScreen from '../Inventory/InventoryMainScreen';
import IRItemsScreen from '../Inventory/IR/IssueRequestScreen';
import CreateIRScreen from '../Inventory/IR/RaiseIssueRequest';
import IRDetailScreen from '../Inventory/IR/IRItemInfo';
import FilteredWorkOrderPage from '../WorkOrders/ScannedWorkOrder';

const QRCodeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NewScanPage" component={NewScanPage} />
    <Stack.Screen name="InventoryOptionsScreen" component={InventoryOptionsScreen} />
    <Stack.Screen name="IssuedRequests" component={IRItemsScreen} />
    <Stack.Screen name="CreateIssueRequest" component={CreateIRScreen} />
    <Stack.Screen name="IrDetail" component={IRDetailScreen} />
    <Stack.Screen name="ScannedWo" component={FilteredWorkOrderPage} />
    <Stack.Screen name="ScannedWoInsturctions" component={BuggyListTopTabs} />
  </Stack.Navigator>
);

// --- Service Requests Stack ---
import ComplaintsScreen from '../MyComplaints/ComplaintsScreen';
import ComplaintDropdown from '../RaiseComplaint/ComplaintDropdown';
import ComplaintCloseScreen from '../MyComplaints/CloseComplaint';
import SubComplaint from '../RaiseComplaint/SubComplaintItem';
import NewComplaintPage from '../RaiseComplaint/CompaintInput';

const ServiceRequestStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ComplaintsScreen" component={ComplaintsScreen} />
    <Stack.Screen name="subComplaint" component={SubComplaint} />
    <Stack.Screen name="complaintInput" component={NewComplaintPage} />
    <Stack.Screen name="CloseComplaint" component={ComplaintCloseScreen} />
    <Stack.Screen name="RaiseComplaint" component={ComplaintDropdown} />
  </Stack.Navigator>
);

// --- Notifications Stack ---
import NotificationMainPage from '../Notification/NotificationScreen';

const NotificationStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NotificationMainPage" component={NotificationMainPage} />
  </Stack.Navigator>
);

// --- More Stack ---
import MoreScreen from '../MoreOptions/MoreScreen';

const MoreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MoreScreen" component={MoreScreen} />
  </Stack.Navigator>
);

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation, showOfflineIndicator, isOnlineMessage, keyboardVisible }) => {
  const { nightMode } = usePermissions();
  const isDarkMode = nightMode;

  // Hide tab bar when keyboard is visible
  if (keyboardVisible) {
    return showOfflineIndicator ? (
      <View style={[
        styles.offlineIndicator,
        { backgroundColor: isOnlineMessage ? '#16A34A' : '#DC2626' }
      ]}>
        <Text style={styles.offlineText}>
          {isOnlineMessage ? 'Back online' : 'You are offline'}
        </Text>
      </View>
    ) : null;
  }

  const tabConfig = [
    { key: 'Home', icon: faHome, label: 'Home' },
    { key: 'ServiceRequests', icon: faFileAlt, label: 'Complaints' },
    { key: 'QRCode', icon: faQrcode, label: '', isCenter: true },
    { key: 'Notifications', icon: faBell, label: 'Notifications' },
    { key: 'More', icon: faEllipsisH, label: 'More' },
  ];

  return (
    <View>
      <View style={[
        styles.tabBarContainer,
        { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }
      ]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tabInfo = tabConfig.find(tab => tab.key === route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (tabInfo?.isCenter) {
            return (
              <View key={route.key} style={styles.centerTabContainer}>
                <View
                  style={styles.centerButton}
                  onTouchEnd={onPress}
                >
                  <View style={styles.centerButtonInner}>
                    <FontAwesomeIcon icon={tabInfo.icon} size={24} color="white" />
                  </View>
                </View>
              </View>
            );
          }

          return (
            <View
              key={route.key}
              style={styles.tabButton}
              onTouchEnd={onPress}
            >
              <FontAwesomeIcon
                icon={tabInfo?.icon}
                size={20}
                color={isFocused ? '#1996D3' : isDarkMode ? '#9CA3AF' : '#6B7280'}
              />
              {tabInfo?.label ? (
                <Text style={[
                  styles.tabLabel,
                  { color: isFocused ? '#1996D3' : isDarkMode ? '#9CA3AF' : '#6B7280' }
                ]}>
                  {tabInfo.label}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
      
      {/* Offline/Online indicator */}
      {showOfflineIndicator && (
        <View style={[
          styles.offlineIndicator,
          { backgroundColor: isOnlineMessage ? '#16A34A' : '#DC2626' }
        ]}>
          <Text style={styles.offlineText}>
            {isOnlineMessage ? 'Back online' : 'You are offline'}
          </Text>
        </View>
      )}
    </View>
  );
};

// --- Main Navigation ---
const MainNavigation = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [user, setUser] = useState({});
  const [siteLogo, setSiteLogo] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);
  const [isOnlineMessage, setIsOnlineMessage] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const systemColorScheme = useColorScheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const {
    setPpmAsstPermissions,
    setIssueRequestPermission,
    setComplaintPermissions,
    setInstructionPermissions,
    setPpmWorkorder,
    setCloseComplaintPermission
  } = usePermissions();

  const users = useSelector((state) => state.users.data);
  const teams = useSelector((state) => state.teams.data);

  // Keyboard visibility listener
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Network connectivity listener - FIXED VERSION
  useEffect(() => {
    let offlineTimer = null;
    let onlineTimer = null;

    const unsubscribe = NetInfo.addEventListener(state => {
      const isCurrentlyConnected = state.isConnected;
      
      // Clear any existing timers
      if (offlineTimer) {
        clearTimeout(offlineTimer);
        offlineTimer = null;
      }
      if (onlineTimer) {
        clearTimeout(onlineTimer);
        onlineTimer = null;
      }
      
      if (!isCurrentlyConnected) {
        // Going offline - show "You are offline" in red for 3 seconds
        setIsOnlineMessage(false);
        setShowOfflineIndicator(true);
        
        offlineTimer = setTimeout(() => {
          setShowOfflineIndicator(false);
        }, 3000);
      } else {
        // Coming back online - show "Back online" in green for 2 seconds
        setIsOnlineMessage(true);
        setShowOfflineIndicator(true);
        
        onlineTimer = setTimeout(() => {
          setShowOfflineIndicator(false);
        }, 2000);
      }
    });

    // Check initial connectivity state
    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        setIsOnlineMessage(false);
        setShowOfflineIndicator(true);
        
        offlineTimer = setTimeout(() => {
          setShowOfflineIndicator(false);
        }, 3000);
      }
    });

    return () => {
      unsubscribe();
      if (offlineTimer) {
        clearTimeout(offlineTimer);
      }
      if (onlineTimer) {
        clearTimeout(onlineTimer);
      }
    };
  }, []); // Fixed: Removed problematic dependencies

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('userTheme');
        setIsDarkMode(savedTheme ? savedTheme === 'dark' : systemColorScheme === 'dark');
      } catch (error) {
        setIsDarkMode(systemColorScheme === 'dark');
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const statusUuids = await workOrderService.getStatuesUuid()
        await AsyncStorage.setItem('statusUuid', JSON.stringify(statusUuids.data));
        const savedPermissions = await AsyncStorage.getItem('userInfo');
        if (savedPermissions) {
          const userInfo = JSON.parse(savedPermissions);
          setUser(userInfo.data.society);
          const perms = userInfo.data.permissions || [];
          setPpmAsstPermissions(perms.filter((p) => p.startsWith('PPM_WOV.')).map((p) => p.split('.')[1]));
          setIssueRequestPermission(perms.filter((p) => p.startsWith('INV_IRQ.')).map((p) => p.split('.')[1]));
          setPpmWorkorder(perms.filter((p) => p.startsWith('PPM_WRK.')).map((p) => p.split('.')[1]));
          setComplaintPermissions(perms.filter((p) => p.startsWith('COM.')).map((p) => p.split('.')[1]));
          setCloseComplaintPermission(perms.filter((p) => p.startsWith('RESCLS.')).map((p) => p.split('.')[1]));

          
          setInstructionPermissions(perms.filter((p) => p.startsWith('PPM_IST.')).map((p) => p.split('.')[1]));
        }
      } catch (error) {
        console.log('Error loading permissions:', error);
      }
    };
    loadPermissions();
  }, []);

  useEffect(() => {
    const fetchLogoAndData = async () => {
      try {
        const societyString = await AsyncStorage.getItem('userInfo');
        if (societyString) {
          const societyData = JSON.parse(societyString);
          const parsedImages = JSON.parse(societyData.data.society.data);
          setSiteLogo(parsedImages.logo);
        }
        await workOrderService.getSiteInfo();
        await workOrderService.getStatuesUuid();

        if (!users?.length || !teams?.length) {
          dispatch(fetchAllTeams());
          dispatch(fetchAllUsers());
        }
      } catch (error) {
        console.log('Error fetching logo and data:', error);
      }
    };
    fetchLogoAndData();
  }, [dispatch, users, teams]);

  useNfcTagHandler({ setPopupVisible, setPopupMessage, setPopupType });

  const handleLogout = async () => {
    try {
      await workOrderService.appUnrigester();
      await AsyncStorage.removeItem('userInfo');
      dispatch(clearAllTeams());
      dispatch(clearAllUsers());
      navigation.replace('Login');
    } catch (error) {
      console.log('Logout error:', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };

  const handleThemeToggle = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('userTheme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: isDarkMode ? '#111827' : '#F9FAFB' }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#1F2937' : '#FFFFFF'}
      />
      <SafeAreaView edges={['top']} style={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }}>
        <Header
          onThemeToggle={handleThemeToggle}
          siteLogo={siteLogo}
          siteName={user}
          user={user}
          isDarkMode={isDarkMode}
        />
      </SafeAreaView>

      <View style={styles.content}>
        <Tab.Navigator
          initialRouteName="Home"
          tabBar={(props) => (
            <CustomTabBar 
              {...props} 
              showOfflineIndicator={showOfflineIndicator} 
              isOnlineMessage={isOnlineMessage}
              keyboardVisible={keyboardVisible}
            />
          )}
          screenOptions={{
            headerShown: false,
            tabBarHideOnKeyboard: true, // This is the key prop for React Navigation v6
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeStack}
            options={{
              tabBarLabel: 'Home',
            }}
          />
          <Tab.Screen 
            name="ServiceRequests" 
            component={ServiceRequestStack}
            options={{
              tabBarLabel: 'Complaints',
            }}
          />
          <Tab.Screen 
            name="QRCode" 
            component={QRCodeStack}
            options={{
              tabBarLabel: '',
            }}
          />
          <Tab.Screen 
            name="Notifications" 
            component={NotificationStack}
            options={{
              tabBarLabel: 'Notifications',
            }}
          />
          <Tab.Screen 
            name="More" 
            component={MoreStack}
            options={{
              tabBarLabel: 'More',
            }}
          />
        </Tab.Navigator>
      </View>

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
        onOk={() => setPopupVisible(false)}
      />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderTopWidth: 0.5,
    borderTopColor: '#D1D5DB',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 54,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  centerTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    top: -16,
  },
  centerButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1996D3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  offlineIndicator: {
    paddingVertical: 3,      // Reduced from 6
    paddingHorizontal: 8,    // Reduced from 12
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 20,           // Reduced from 28
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 10,            // Reduced from 12
    fontWeight: '500',       // Reduced from '600'
    textAlign: 'center',
  },
});

export default MainNavigation;