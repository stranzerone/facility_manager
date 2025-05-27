import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Platform,
  StatusBar,
  useColorScheme,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { usePermissions } from "../GlobalVariables/PermissionsContext";

const TechnicianDashboard = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [animatedCards, setAnimatedCards] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Dark mode detection
  const systemColorScheme = useColorScheme();
  const {nightMode}  = usePermissions()
  const isDarkMode =  nightMode;

  // Color schemes
const CUSTOM_PRIMARY = "#1996D3"; // 🔷 Replace this with your actual brand color

const lightTheme = {
  primaryColor: CUSTOM_PRIMARY,
  backgroundColor: "#F2F2F7",
  cardBackground: "#FFFFFF",
  textPrimary: "#000000",
  textSecondary: "#6D6D70",
  shadowColor: "#000000",
  statusBarStyle: "dark-content",
};

const darkTheme = {
  primaryColor: CUSTOM_PRIMARY,
  backgroundColor: "#000000",
  cardBackground: "#1C1C1E",
  textPrimary: "#FFFFFF",
  textSecondary: "#8E8E93",
  shadowColor: "#FFFFFF",
  statusBarStyle: "light-content",
};


  // Current theme based on mode
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Sync data (replacing work order data)
  const syncData = {
    syncedItems: 12,
    queuedItems: 3,
    lastSynced: "10:45 AM"
  };

  // Technician work data with theme-aware colors
  const workCategories = [
    {
      id: "OW",
      name: "Open Work Orders",
      count: 5,
      icon: "file-text",
      color: theme.primaryColor,
      iconBgColor: "#FFFFFF",
      route: "MyWorkOrders",
      active: true,
    },
    {
      id: "UW",
      name: "Upcoming Work",
      count: 3,
      icon: "calendar",
      color: "#FFFFFF",
      iconBgColor: "#4CD97B",
      route: "FutureWorkOrders",
      active: true,
    },
    {
      id: "OC",
      name: "Open Complaints",
      count: 4,
      icon: "message-square",
      color: "#FFFFFF",
      iconBgColor: "#FF8A85",
      route: "ServiceRequests",
      active: true,
    },
    {
      id: "ME",
      name: "Escalations",
      count: 2,
      icon: "alert-circle",
      color: "#FFFFFF",
      iconBgColor: "#FFD66B",
      route: "MyWorkOrders",
      active: false,
    },
  ];
  
  const handlePressIn = (key) => {
    setAnimatedCards(prev => ({ ...prev, [key]: true }));
  };

  const handlePressOut = (key) => {
    setAnimatedCards(prev => ({ ...prev, [key]: false }));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh - in production, replace with actual sync logic
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.backgroundColor} />

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 12, paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Offline Sync Card (previously Work Progress Card) */}
        <View style={{ 
          backgroundColor: theme.primaryColor, 
          borderRadius: 12, 
          padding: 14,
          marginVertical: 10,
          shadowColor: theme.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkMode ? 0.3 : 0.2,
          shadowRadius: 6,
          elevation: 4,
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
              Offline Sync
            </Text>
            <Pressable 
              onPress={handleRefresh}
              style={({ pressed }) => ({ 
                opacity: pressed ? 0.7 : 1,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: 6,
                borderRadius: 20,
              })}
            >
              <Feather 
                name={refreshing ? "loader" : "refresh-cw"} 
                size={16} 
                color="#FFFFFF" 
                style={refreshing ? { transform: [{ rotate: '45deg' }] } : {}}
              />
            </Pressable>
          </View>
          
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Sync Status */}
              <View style={{ 
                width: 60, 
                height: 60, 
                borderRadius: 30, 
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
                borderWidth: 4,
                borderColor: "rgba(255, 255, 255, 0.5)",
              }}>
                <Feather name="cloud" size={22} color="#FFFFFF" />
              </View>
              
              <View>
                <Text style={{ color: "#FFFFFF", fontSize: 14 }}>
                  {syncData.syncedItems} <Text style={{ fontSize: 12, opacity: 0.8 }}>items synced</Text>
                </Text>
                <Text style={{ color: "#FFFFFF", fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                  Last: {syncData.lastSynced}
                </Text>
              </View>
            </View>
            
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#FFFFFF", fontSize: 24, fontWeight: "bold" }}>
                {syncData.queuedItems}
              </Text>
              <Text style={{ color: "#FFFFFF", fontSize: 12, opacity: 0.8 }}>
                Queue
              </Text>
            </View>
          </View>
        </View>

        {/* Work Categories Section */}
        <Text style={{ fontSize: 16, fontWeight: "600", color: theme.textPrimary, marginBottom: 10, marginTop: 6 }}>
          Quick Access
        </Text>
        
        {/* Work Categories Grid - now with larger cards */}
        <View style={{ 
          flexDirection: "row", 
          flexWrap: "wrap", 
          justifyContent: "space-between" 
        }}>
          {workCategories.map((category) => (
            <Pressable
              key={category.id}
              onPressIn={() => category.active && handlePressIn(category.id)}
              onPressOut={() => category.active && handlePressOut(category.id)}
              onPress={() => {
                if (!category.active) return;
                navigation.navigate(category.route, {
                  screen: category.subroute || "NewScanPage",
                  params: { screenType: category.id },
                });
              }}
              disabled={!category.active}
              style={{
                width: "48%", // Keep width the same, but fewer cards means more vertical space
                backgroundColor: category.id === "OW" ? theme.primaryColor : theme.cardBackground,
                borderRadius: 12,
                marginBottom: 16, // Increased bottom margin
                padding: 16, // Increased padding
                shadowColor: theme.shadowColor,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isDarkMode ? 0.3 : 0.05,
                shadowRadius: 4,
                elevation: 2,
                opacity: category.active ? 1 : 0.7,
                transform: [{ scale: animatedCards[category.id] ? 0.97 : 1 }],
                height: 140, // Increased height from 110 to 140
                borderWidth: isDarkMode ? 1 : 0,
                borderColor: isDarkMode ? "#2C2C2E" : "transparent",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                <Text style={{ 
                  color: category.id === "OW" ? "#FFFFFF" : theme.textPrimary, 
                  fontSize: 15, // Increased font size
                  fontWeight: "600",
                  width: '80%',
                  numberOfLines: 1,
                  ellipsizeMode: 'tail'
                }}>
                  {category.name}
                </Text>
                <Feather 
                  name="more-vertical" 
                  size={16} 
                  color={category.id === "OW" ? "#FFFFFF" : theme.textSecondary} 
                />
              </View>
              
              <Text style={{ 
                color: category.id === "OW" ? "rgba(255,255,255,0.7)" : theme.textSecondary, 
                fontSize: 12, // Increased font size
                marginBottom: 14 // Increased margin
              }}>
                {category.active ? "Tap to view" : "Access required"}
              </Text>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                <Text style={{ 
                  color: category.id === "OW" ? "#FFFFFF" : theme.primaryColor, 
                  fontSize: 22, // Increased font size
                  fontWeight: "bold" 
                }}>
                  {category.count}
                  <Text style={{ 
                    fontSize: 12, 
                    fontWeight: "normal", 
                    color: category.id === "OW" ? "rgba(255,255,255,0.7)" : theme.textSecondary 
                  }}> items</Text>
                </Text>
                
                <View style={{ 
                  width: 40, // Increased size
                  height: 40, // Increased size
                  borderRadius: 20, 
                  backgroundColor: category.iconBgColor,
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Feather 
                    name={category.icon} 
                    size={20} 
                    color={category.id !== "OW" ? category.color : category.iconBgColor} 
                  />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default TechnicianDashboard;