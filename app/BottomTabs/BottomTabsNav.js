import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  StatusBar,
  Alert,
  Appearance,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Screens & Components
import Header from './Header';
import Footer from './Bottom';
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
    <Stack.Screen name="More" component={MoreScreen} />
  </Stack.Navigator>
);

// --- Main Navigation ---
export default MainNavigation = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [modalVisible, setModalVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [user, setUser] = useState({});
  const [siteLogo, setSiteLogo] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const systemColorScheme = useColorScheme();
  const dispatch = useDispatch();

  const navigation = useNavigation();

  const {
    setPpmAsstPermissions,
    setIssueRequestPermission,
    setComplaintPermissions,
    setInstructionPermissions,
    setPpmWorkorder,
  } = usePermissions();

  const users = useSelector((state) => state.users.data);
  const teams = useSelector((state) => state.teams.data);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('userTheme');
      setIsDarkMode(savedTheme ? savedTheme === 'dark' : systemColorScheme === 'dark');
    };
    loadTheme();
  }, [systemColorScheme]);

  useEffect(() => {
    const loadPermissions = async () => {
      const savedPermissions = await AsyncStorage.getItem('userInfo');
      if (savedPermissions) {
        const userInfo = JSON.parse(savedPermissions);
        setUser(userInfo.data.society);
        const perms = userInfo.data.permissions || [];
        setPpmAsstPermissions(perms.filter((p) => p.startsWith('PPM_WOV.')).map((p) => p.split('.')[1]));
        setIssueRequestPermission(perms.filter((p) => p.startsWith('INV_IRQ.')).map((p) => p.split('.')[1]));
        setPpmWorkorder(perms.filter((p) => p.startsWith('PPM_WRK.')).map((p) => p.split('.')[1]));
        setComplaintPermissions(perms.filter((p) => p.startsWith('COM.')).map((p) => p.split('.')[1]));
        setInstructionPermissions(perms.filter((p) => p.startsWith('PPM_IST.')).map((p) => p.split('.')[1]));
      }
    };
    loadPermissions();
  }, []);

  useEffect(() => {
    const fetchLogoAndData = async () => {
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
    } catch {
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };

  const handleThemeToggle = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem('userTheme', newTheme ? 'dark' : 'light');
    // Note: Appearance.setColorScheme is not a setter in React Native,
    // usually system controlled, you can remove or handle differently
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
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' }, // hide default tab bar
          }}
          // Optional: listen to tab change events if needed
          // onTabPress={({ route }) => setActiveTab(route.name)}
        >
          <Tab.Screen name="Home" component={HomeStack} />
          <Tab.Screen name="QRCode" component={QRCodeStack} />
          <Tab.Screen name="ServiceRequests" component={ServiceRequestStack} />
          <Tab.Screen name="Notifications" component={NotificationStack} />
          <Tab.Screen name="More" component={HomeStack} />
        </Tab.Navigator>
      </View>

      <Footer
        activeTab={activeTab}
        onTabPress={(tabKey) => {
          setActiveTab(tabKey);
          navigation.navigate(tabKey);
        }}
      />

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
});

