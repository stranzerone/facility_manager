import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useLayoutEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Platform,
  StatusBar,
  useColorScheme,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { usePermissions } from "../GlobalVariables/PermissionsContext";
import { getQueueLength, readFromFile } from "../../offline/fileSystem/fileOperations";
import { getOfflineData, syncOfflineQueue } from "../../offline/fileSystem/offlineSync";

const TechnicianDashboard = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [animatedCards, setAnimatedCards] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [complaintsLenght,setComplaintsLength]  = useState(0)
  // Get all required values from global context
  const { 
    queueLength, 
    syncStatus, 
    syncTime, 
    nightMode, 
    fetchingOffline, 
    setFetchingOffline 
  } = usePermissions();
  
  const [queueLenghtFile, setQueueLengthFile] = useState(0);
  const [openWoLength, setOpenWoLength] = useState(0);
  
  // Animation refs for sync status
  const cloudAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const tickAnimation = useRef(new Animated.Value(0)).current;
  
  const isDarkMode = nightMode;

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

  // Sync animations
  useEffect(() => {
    if (syncStatus) {
      // Start all animations when syncing
      const cloudAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(cloudAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(cloudAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );

      const pulseAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      const rotateAnim = Animated.loop(
        Animated.timing(rotateAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      cloudAnim.start();
      pulseAnim.start();
      rotateAnim.start();

      return () => {
        cloudAnim.stop();
        pulseAnim.stop();
        rotateAnim.stop();
      };
    } else {
      // Reset animations when not syncing
      cloudAnimation.setValue(0);
      pulseAnimation.setValue(1);
      rotateAnimation.setValue(0);
      
      // Animate tick mark when ready and queue is 0
      if (queueLenghtFile === 0) {
        Animated.sequence([
          Animated.timing(tickAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(tickAnimation, {
            toValue: 0.9,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(tickAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [syncStatus, queueLenghtFile]);

  // Interpolated values for animations
  const cloudTranslateY = cloudAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const cloudOpacity = cloudAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.6, 1],
  });

  const rotateInterpolate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Technician work data with theme-aware colors
  const workCategories = [
    {
      id: "OW",
      name: "Open Work Orders",
      count: openWoLength,
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
      count: complaintsLenght,
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncOfflineQueue();
    } catch (error) {
      console.log('Error during refresh:', error);
    } finally {
      // Simulate refresh - in production, replace with actual sync logic
      setTimeout(() => {
        setRefreshing(false);
      }, 1500);
    }
  };

  console.log(queueLength, 'this is queuelength at init');
  console.log(fetchingOffline, 'fetchingOffline status from global state');

  useFocusEffect(
    useCallback(() => {
      let intervalId = null;

      const pollQueueLength = async () => {
        try {
          const length = await getQueueLength('queueData');
          setQueueLengthFile(length);
        } catch (error) {
          console.log('Error getting queue length:', error);
        }
      };

const getOpenWoLength = async () => {
  try {
    const response = await readFromFile('ch_workorders');
    const com_response = await readFromFile('ch_complaints');
    console.log(com_response, 'this com response');

    const now = new Date();

    // Filter work orders by due date
    const filteredWorkorders = Object.values(response).filter(wo => {
      const dueDate = new Date(wo["Due Date"]);
      return dueDate <= now;
    });

    // Filter complaints with status === "open"
    const openComplaints = Object.values(com_response.data).filter(
      c => c.status?.toLowerCase() === 'open'
    );

    console.log("Filtered work orders length:", filteredWorkorders.length);
    console.log("Open complaints length:", openComplaints.length);

    setComplaintsLength(openComplaints.length);
    setOpenWoLength(filteredWorkorders.length);
  } catch (error) {
    console.log('Error getting open work orders length:', error);
  }
};


      // Always run once on focus
      getOpenWoLength();
      pollQueueLength();

      // Only start polling every 2s if syncStatus is true
      if (syncStatus && queueLenghtFile > 0) {
        intervalId = setInterval(pollQueueLength, 2000);
      }

      // Clean up on unfocus
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [syncStatus, queueLenghtFile])
  );

  const refreshOfflineData = async () => {
    try {
      // Set global loading state to true before starting
      setFetchingOffline(true);
      
      // Call the offline data fetch function
      await getOfflineData(setFetchingOffline);
      
      // Note: setFetchingOffline(false) should be called inside getOfflineData
      // when the operation completes, but we'll add a safety net here
      
    } catch (error) {
      console.log(error, 'error in refreshOfflineData');
      // Ensure we reset the loading state even if there's an error
      setFetchingOffline(false);
    }
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600", marginRight: 8 }}>
                Offline Sync
              </Text>
              {syncStatus && queueLenghtFile > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {/* Animated syncing indicator dots */}
                  <Animated.View style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    marginRight: 2,
                    transform: [{ 
                      translateY: cloudAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -3],
                      })
                    }],
                  }} />
                  <Animated.View style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                    marginRight: 2,
                    transform: [{ 
                      translateY: cloudAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -3],
                      })
                    }],
                  }} />
                  <Animated.View style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.4)",
                    transform: [{ 
                      translateY: cloudAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -3],
                      })
                    }],
                  }} />
                </View>
              )}
            </View>
            <Pressable 
              onPress={refreshOfflineData}
              disabled={fetchingOffline} // Disable button while fetching
              style={({ pressed }) => ({ 
                opacity: (pressed || fetchingOffline) ? 0.7 : 1,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: 6,
                borderRadius: 20,
              })}
            >
              <Animated.View style={{
                transform: [{ rotate: (refreshing || fetchingOffline) ? rotateInterpolate : '0deg' }]
              }}>
                <Feather 
                  name={(refreshing || fetchingOffline) ? "loader" : "refresh-cw"} 
                  size={16} 
                  color="#FFFFFF" 
                />
              </Animated.View>
            </Pressable>
          </View>
          
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Sync Status with Animation */}
              <Animated.View style={{ 
                width: 60, 
                height: 60, 
                borderRadius: 30, 
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
                borderWidth: 4,
                borderColor: "rgba(255, 255, 255, 0.5)",
                transform: [{ scale: (syncStatus || fetchingOffline) ? pulseAnimation : 1 }],
              }}>
                <Animated.View style={{
                  transform: [
                    { translateY: (syncStatus || fetchingOffline) ? cloudTranslateY : 0 },
                  ],
                  opacity: (syncStatus || fetchingOffline) ? cloudOpacity : 1,
                }}>
                  <Feather 
                    name={(syncStatus || fetchingOffline) ? "upload-cloud" : "cloud"} 
                    size={22} 
                    color="#FFFFFF" 
                  />
                </Animated.View>
                
                {/* Additional animated elements for active sync */}
                {(syncStatus || fetchingOffline) && (
                  <>
                    <Animated.View style={{
                      position: 'absolute',
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.4)',
                      top: 15,
                      right: 15,
                      transform: [{ 
                        scale: cloudAnimation.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 1, 0],
                        })
                      }],
                    }} />
                    <Animated.View style={{
                      position: 'absolute',
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      top: 20,
                      left: 18,
                      transform: [{ 
                        scale: cloudAnimation.interpolate({
                          inputRange: [0, 0.3, 0.7, 1],
                          outputRange: [0, 0, 1, 0],
                        })
                      }],
                    }} />
                  </>
                )}
              </Animated.View>
              
              <View>
                <Text style={{ color: "#FFFFFF", fontSize: 14 }}>
                  {queueLenghtFile} items remaining
                </Text>
                <Text style={{ color: "#FFFFFF", fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                  {(syncStatus || fetchingOffline) ? 
                    (queueLenghtFile === 0 ? "Preparing..." : fetchingOffline ? "Fetching..." : "Syncing...") : 
                    `Last: ${syncTime}`
                  }
                </Text>
              </View>
            </View>
            
            <View style={{ alignItems: "center" }}>
              {!fetchingOffline && queueLenghtFile === 0 ? (
                <Animated.View style={{
                  transform: [{ scale: tickAnimation }]
                }}>
                  <Feather 
                    name="check-circle" 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </Animated.View>
              ) : (
                <Animated.View style={{
                  transform: [{ rotate: fetchingOffline ? rotateInterpolate : '0deg' }]
                }}>
                  <Feather 
                    name={fetchingOffline ? "loader" : "clock"} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </Animated.View>
              )}
              <Text style={{ color: "#FFFFFF", fontSize: 12, opacity: 0.8 }}>
                {fetchingOffline ? "Fetching..." : (queueLenghtFile === 0 ? "Ready" : "Loading ...")}
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