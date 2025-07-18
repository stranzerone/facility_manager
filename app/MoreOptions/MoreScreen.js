import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StatusBar,
  Switch,
  Alert,
  Image,
  Appearance,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { usePermissions } from "../GlobalVariables/PermissionsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {APP_VERSION} from "@env"
import { useDispatch } from "react-redux";
import { clearAllTeams } from '../../utils/Slices/TeamSlice';
import { clearAllUsers } from '../../utils/Slices/UsersSlice';
import { workOrderService } from "../../services/apis/workorderApis";
import DynamicPopup from "../DynamivPopUps/DynapicPopUpScreen";
import { clearQueue,deleteFile } from "../../offline/fileSystem/fileOperations";

const MoreScreen = ({ navigation }) => {
  const [animatedItems, setAnimatedItems] = useState({});
  const [notificationSound, setNotificationSound] = useState(true);
  const [user, setUser] = useState({});
  const [themeMode, setThemeMode] = useState(null); // Initialize as null to prevent premature rendering
  const [isThemeLoaded, setIsThemeLoaded] = useState(false); // Track loading state
  
  // Dynamic popup states
  const [modalVisible, setModalVisible] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    type: 'info',
    message: '',
    onOk: null,
    showCancel: false
  });

  // Get theme and other global states from context
  const {
    nightMode,
    setNightMode,
  } = usePermissions();

  const isDarkMode = nightMode;
  const dispatch = useDispatch()
  
  // Sample user data - replace with actual user data from context/API
  const userData = {
    name: user?.name,
    technicianId: user?.designation_name,
    email: "john.technician@company.com",
    phone: "+1 (555) 123-4567",
    department: user?.role,
    joinDate: "January 2023",
    profileImage: null,
    completedJobs: 247,
    rating: 4.8,
  };

  // Color schemes matching your dashboard
  const CUSTOM_PRIMARY = "#1996D3";

  const lightTheme = {
    primaryColor: CUSTOM_PRIMARY,
    backgroundColor: "#F2F2F7",
    cardBackground: "#FFFFFF",
    textPrimary: "#000000",
    textSecondary: "#6D6D70",
    shadowColor: "#000000",
    statusBarStyle: "dark-content",
    separatorColor: "#E5E5EA",
    dangerColor: "#FF3B30",
  };

  const darkTheme = {
    primaryColor: CUSTOM_PRIMARY,
    backgroundColor: "#000000",
    cardBackground: "#1C1C1E",
    textPrimary: "#FFFFFF",
    textSecondary: "#8E8E93",
    shadowColor: "#FFFFFF",
    statusBarStyle: "light-content",
    separatorColor: "#38383A",
    dangerColor: "#FF453A",
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Function to show coming soon popup
  const showComingSoonPopup = () => {
    setPopupConfig({
      type: 'info',
      message: 'Coming Soon! This feature will be available in the next update.',
      onOk: () => setModalVisible(false),
      showCancel: false
    });
    setModalVisible(true);
  };

  // Function to show logout confirmation
  const showLogoutConfirmation = () => {
    setPopupConfig({
      type: 'warning',
      message: 'You will be logged out. Are you sure you want to log out?',
      onOk: () => {
        setModalVisible(false);
        handleLogout();
      },
      showCancel: true
    });
    setModalVisible(true);
  };

  // Combined useEffect to load theme preference - FIXED
useEffect(() => {
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('nightMode'); // 'light', 'dark', or 'system'

      if (savedTheme) {
        setThemeMode(savedTheme); // for UI radio check

        if (savedTheme === 'light') {
          setNightMode(false);
        } else if (savedTheme === 'dark') {
          setNightMode(true);
        } else if (savedTheme === 'system') {
          const systemColorScheme = Appearance.getColorScheme();
          setNightMode(systemColorScheme === 'dark');
        }
      } else {
        setThemeMode('light');
        setNightMode(false);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      setThemeMode('light');
      setNightMode(false);
    } finally {
      setIsThemeLoaded(true);
    }
  };
  loadThemePreference();
}, []);


  // Function to handle theme selection - FIXED
 const handleThemeSelection = async (selectedTheme) => {
  try {
    setThemeMode(selectedTheme);

    if (selectedTheme === 'system') {
      await AsyncStorage.setItem('NMSystem', 'true');
      await AsyncStorage.setItem('nightMode', selectedTheme);

      const colorScheme = Appearance.getColorScheme();
      setNightMode(colorScheme === 'dark');
    } else {
      await AsyncStorage.removeItem('NMSystem');
      await AsyncStorage.setItem('nightMode', selectedTheme); // ✅ fixed here

      const isDark = selectedTheme === 'dark';
      setNightMode(isDark);
    }
  } catch (error) {
    console.error('Error setting theme mode:', error);
  }
};


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userInfo');
        if (userData) {
          const user = JSON.parse(userData);
          setUser(user.data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await workOrderService.appUnrigester();
      await AsyncStorage.removeItem('userInfo');
      await clearQueue('queueData');
      await deleteFile();
      dispatch(clearAllTeams());
      dispatch(clearAllUsers());
      navigation.replace("Login");
    } catch (error) {
      console.error('Error clearing local storage', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };

  // Menu sections configuration
  const menuSections = [
    {
      id: "account",
      title: "Account Settings",
      items: [
        {
          id: "editProfile",
          title: "Edit Profile",
          subtitle: "Update your personal information",
          icon: "edit-3",
          onPress: showComingSoonPopup,
          showArrow: true,
        },
        {
          id: "changePassword",
          title: "Change Password",
          subtitle: "Update your security credentials",
          icon: "lock",
          onPress: showComingSoonPopup,
          showArrow: true,
        },
      ],
    },
    {
      id: "preferences",
      title: "Preferences",
      items: [
        {
          id: "notifications",
          title: "Notification Sound",
          subtitle: "Enable or disable notification sounds",
          icon: notificationSound ? "volume-2" : "volume-x",
          onPress: () => setNotificationSound(!notificationSound),
          showToggle: true,
          toggleValue: notificationSound,
        },
      ],
    },
    {
      id: "theme",
      title: "Theme",
      items: [
        {
          id: "lightMode",
          title: "Light Mode",
          subtitle: "Use light theme",
          icon: "sun",
          onPress: () => handleThemeSelection('light'),
          showRadio: true,
          radioSelected: themeMode == 'light',
        },
        {
          id: "darkMode",
          title: "Dark Mode",
          subtitle: "Use dark theme",
          icon: "moon",
          onPress: () => handleThemeSelection('dark'),
          showRadio: true,
          radioSelected: themeMode == 'dark',
        },
        {
          id: "systemMode",
          title: "System Default",
          subtitle: "Follow system setting",
          icon: "smartphone",
          onPress: () => handleThemeSelection('system'),
          showRadio: true,
          radioSelected: themeMode == 'system',
        },
      ],
    },
    {
      id: "support",
      title: "Support & Information",
      items: [
        {
          id: "whatsNew",
          title: "What's New",
          subtitle: "Latest updates and features",
          icon: "zap",
          onPress: showComingSoonPopup,
          showArrow: true,
          badge: "NEW",
        },
        {
          id: "raiseIssue",
          title: "Raise Issue",
          subtitle: "Report a problem or bug",
          icon: "alert-circle",
          onPress: showComingSoonPopup,
          showArrow: true,
        },
        {
          id: "contactUs",
          title: "Contact Us",
          subtitle: "Get in touch with support",
          icon: "phone",
          onPress: showComingSoonPopup,
          showArrow: true,
        },
        {
          id: "aboutUs",
          title: "About Us",
          subtitle: "Learn more about our company",
          icon: "info",
          onPress: showComingSoonPopup,
          showArrow: true,
        },
      ],
    },
  ];

  const handlePressIn = (itemId) => {
    setAnimatedItems(prev => ({ ...prev, [itemId]: true }));
  };

  const handlePressOut = (itemId) => {
    setAnimatedItems(prev => ({ ...prev, [itemId]: false }));
  };

  const renderMenuItem = (item, isLast = false) => (
    <Pressable
      key={item.id}
      onPressIn={() => handlePressIn(item.id)}
      onPressOut={() => handlePressOut(item.id)}
      onPress={item.onPress}
      style={{
        backgroundColor: theme.cardBackground,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.separatorColor,
        transform: [{ scale: animatedItems[item.id] ? 0.98 : 1 }],
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Icon Container */}
        <View style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: item.id === "themeMode" && isDarkMode ?
            "rgba(255, 255, 255, 0.1)" :
            `${theme.primaryColor}15`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}>
          <Feather
            name={item.icon}
            size={18}
            color={item.id === "themeMode" && isDarkMode ?
              "#FFFFFF" :
              theme.primaryColor
            }
          />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{
              color: theme.textPrimary,
              fontSize: 16,
              fontWeight: "500",
            }}>
              {item.title}
            </Text>
            {item.badge && (
              <View style={{
                backgroundColor: theme.primaryColor,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 10,
                marginLeft: 8,
              }}>
                <Text style={{
                  color: "#FFFFFF",
                  fontSize: 10,
                  fontWeight: "600",
                }}>
                  {item.badge}
                </Text>
              </View>
            )}
          </View>
          {item.subtitle && (
            <Text style={{
              color: theme.textSecondary,
              fontSize: 13,
              marginTop: 2,
            }}>
              {item.subtitle}
            </Text>
          )}
        </View>

        {/* Right Side Actions */}
        {item.showToggle && (
          <Switch
            value={item.toggleValue}
            onValueChange={item.onPress}
            trackColor={{
              false: isDarkMode ? "#39393D" : "#E9E9EA",
              true: theme.primaryColor
            }}
            thumbColor={item.toggleValue ? "#FFFFFF" : "#FFFFFF"}
            ios_backgroundColor={isDarkMode ? "#39393D" : "#E9E9EA"}
          />
        )}

        {item.showRadio && (
          <View style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: item.radioSelected ? theme.primaryColor : theme.textSecondary,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: item.radioSelected ? theme.primaryColor : 'transparent',
          }}>
            {item.radioSelected && (
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#FFFFFF',
              }} />
            )}
          </View>
        )}

        {item.showArrow && (
          <Feather
            name="chevron-right"
            size={18}
            color={theme.textSecondary}
          />
        )}
      </View>
    </Pressable>
  );

  // Show loading or nothing until theme is loaded
  if (!isThemeLoaded) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: theme.backgroundColor,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ color: theme.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.backgroundColor} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={{
          backgroundColor: theme.cardBackground,
          marginHorizontal: 16,
          marginTop: 16,
          borderRadius: 16,
          padding: 24,
          shadowColor: theme.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkMode ? 0.3 : 0.15,
          shadowRadius: 8,
          elevation: 6,
        }}>
          {/* Profile Image and Basic Info */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: userData.profileImage ? "transparent" : theme.primaryColor,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}>
              {userData.profileImage ? (
                <Image
                  source={{ uri: userData.profileImage }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
              ) : (
                <Feather name="user" size={40} color="#FFFFFF" />
              )}
            </View>

            <Text style={{
              color: theme.textPrimary,
              fontSize: 24,
              fontWeight: "700",
              marginBottom: 4,
            }}>
              {userData.name}
            </Text>

            <Text style={{
              color: theme.textSecondary,
              fontSize: 16,
              marginBottom: 2,
            }}>
              {userData.technicianId}
            </Text>

            <Text style={{
              color: theme.textSecondary,
              fontSize: 14,
            }}>
              {userData.department}
            </Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={section.id} style={{ marginTop: 24 }}>
            <Text style={{
              color: theme.textSecondary,
              fontSize: 13,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginHorizontal: 16,
              marginBottom: 8,
            }}>
              {section.title}
            </Text>

            <View style={{
              backgroundColor: theme.cardBackground,
              marginHorizontal: 16,
              borderRadius: 12,
              overflow: "hidden",
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDarkMode ? 0.3 : 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}>
              {section.items.map((item, itemIndex) =>
                renderMenuItem(item, itemIndex === section.items.length - 1)
              )}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={{
          alignItems: "center",
          marginTop: 32,
          marginBottom: 16,
        }}>
          <Text style={{
            color: theme.textSecondary,
            fontSize: 13,
          }}>
            App Version {APP_VERSION}
          </Text>
        </View>

        {/* Logout Button */}
        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          <Pressable
            onPress={showLogoutConfirmation}
            style={({ pressed }) => ({
              backgroundColor: theme.dangerColor,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
              opacity: pressed ? 0.8 : 1,
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDarkMode ? 0.3 : 0.1,
              shadowRadius: 4,
              elevation: 2,
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather name="log-out" size={18} color="#FFFFFF" />
              <Text style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "600",
                marginLeft: 8,
              }}>
                Logout
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Dynamic Popup */}
        <DynamicPopup
          visible={modalVisible}
          type={popupConfig.type}
          message={popupConfig.message}
          onClose={() => setModalVisible(false)}
          onOk={popupConfig.onOk}
          showCancel={popupConfig.showCancel}
        />
      </ScrollView>
    </View>
  );
};

export default MoreScreen;