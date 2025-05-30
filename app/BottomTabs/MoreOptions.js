import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Platform,
  StatusBar,
  Animated,
  TextInput,
  FlatList,
  ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { workOrderService } from "../../offline/services/apis/workorderApis";

const OfflineSyncDashboard = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  
  // Modern color palette
  const colors = {
    primary: "#1E293B",         // Dark slate blue
    accent: "#3B82F6",          // Vibrant blue
    success: "#10B981",         // Green
    warning: "#F59E0B",         // Amber
    error: "#EF4444",           // Red
    light: "#F8FAFC",           // Very light background
    white: "#FFFFFF",           // White
    border: "#E2E8F0",          // Light border
    textPrimary: "#1E293B",     // Dark text
    textSecondary: "#64748B",   // Medium text
    purple: "#8B5CF6",          // Purple accent
    pink: "#EC4899",            // Pink accent
    cardBg1: "#EFF6FF",         // Light blue background
    cardBg2: "#F0FDF4",         // Light green background
    cardBg3: "#FEF3C7",         // Light amber background
    cardBg4: "#F3E8FF",         // Light purple background
  };
  
  // Animation values for progress bars
  const [downloadProgressValue] = useState(new Animated.Value(0));
  const [uploadProgressValue] = useState(new Animated.Value(0));
  const [downloadProgress, setDownloadProgress] = useState(78);
  const [uploadProgress, setUploadProgress] = useState(62);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sync stats
  const [syncStats, setSyncStats] = useState({
    setQueueStatus: 24,
    completedItems: 156,
    downloadedData: "104.5 MB",
    uploadedData: "42.8 MB",
    lastSynced: "2 min ago",
    totalCacheSize: "147.3 MB",
  });
  
  // Asset management state
  const [assets, setAssets] = useState([ ]);
  
  const [selectedAssets, setSelectedAssets] = useState([]);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter available assets (not already selected)

  
  // Animate progress bars
  useEffect(() => {
    Animated.timing(downloadProgressValue, {
      toValue: downloadProgress / 100,
      duration: 1500,
      useNativeDriver: false,
    }).start();
    
    Animated.timing(uploadProgressValue, {
      toValue: uploadProgress / 100,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [downloadProgress, uploadProgress]);
  
  const downloadProgressWidth = downloadProgressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });
  
  const uploadProgressWidth = uploadProgressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });
  
  // Add asset to selected list
  const addAsset = (asset) => {
    setSelectedAssets([...selectedAssets, asset]);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };
  
  // Remove asset from selected list
  const removeAsset = (assetId) => {
    setSelectedAssets(selectedAssets?.filter(asset => asset.id !== assetId));
  };
  
useEffect(() => {
  const fetchAssets = async () => {
    try {
      const response = await workOrderService.getAsets(searchQuery);
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  };

  fetchAssets();
}, [searchQuery]);


  // Mock API call
  const handleSyncNow = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update progress numbers
      setDownloadProgress(Math.min(100, downloadProgress + Math.floor(Math.random() * 10)));
      setUploadProgress(Math.min(100, uploadProgress + Math.floor(Math.random() * 15)));
      
      // Update stats
      setSyncStats({
        ...syncStats,
        setQueueStatus: Math.max(0, syncStats.setQueueStatus - 5),
        completedItems: syncStats.completedItems + 5,
        lastSynced: "Just now",
      });
      
      setIsLoading(false);
    }, 2000);
  };

  // Card shadow style
  const cardShadow = Platform.select({
    ios: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    android: {
      elevation: 3,
    }
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.light }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.light} />
      
      {/* Modern Header with Blurred Background */}
      <View style={{ 
        backgroundColor: colors.white, 
        paddingTop: 5, 
        paddingBottom: 16, 
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        ...cardShadow
      }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Pressable 
            style={{ 
              width: 40, 
              height: 40,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.light
            }}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color={colors.primary} />
          </Pressable>
          
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.primary }}>
            Offline Sync Dashboard
          </Text>
          
          <Pressable 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 12, 
              backgroundColor: colors.light, 
              alignItems: "center", 
              justifyContent: "center",
            }}
            onPress={() => console.log("Settings")}
          >
            <Feather name="settings" size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sync Status Dashboard */}
        <View style={{ 
          backgroundColor: colors.white,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border,
          ...cardShadow
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "700" }}>
              Sync Status
            </Text>
            
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather name="clock" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                {syncStats.lastSynced}
              </Text>
            </View>
          </View>
          
          {/* Download Progress Bar */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: "500" }}>
                Downloaded Data
              </Text>
              <Text style={{ color: colors.accent, fontSize: 14, fontWeight: "600" }}>
                {downloadProgress}% • {syncStats.downloadedData}
              </Text>
            </View>
            
            <View style={{ 
              width: "100%", 
              height: 8, 
              backgroundColor: colors.border, 
              borderRadius: 4, 
              overflow: "hidden" 
            }}>
              <Animated.View 
                style={{ 
                  height: "100%", 
                  width: downloadProgressWidth, 
                  backgroundColor: colors.accent, 
                  borderRadius: 4 
                }} 
              />
            </View>
          </View>
          
          {/* Upload Progress Bar */}
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: "500" }}>
                Uploaded Data
              </Text>
              <Text style={{ color: colors.purple, fontSize: 14, fontWeight: "600" }}>
                {uploadProgress}% • {syncStats.uploadedData}
              </Text>
            </View>
            
            <View style={{ 
              width: "100%", 
              height: 8, 
              backgroundColor: colors.border, 
              borderRadius: 4, 
              overflow: "hidden" 
            }}>
              <Animated.View 
                style={{ 
                  height: "100%", 
                  width: uploadProgressWidth, 
                  backgroundColor: colors.purple, 
                  borderRadius: 4 
                }} 
              />
            </View>
          </View>
          
          {/* Stats Cards */}
          <View style={{ 
            flexDirection: "row", 
            justifyContent: "space-between", 
            marginTop: 24,
            flexWrap: "wrap"
          }}>
            <View style={{ 
              width: "31%", 
              backgroundColor: colors.cardBg1, 
              borderRadius: 16, 
              padding: 14, 
              alignItems: "center"
            }}>
              <Text style={{ color: colors.accent, fontSize: 24, fontWeight: "700" }}>
                {syncStats.setQueueStatus}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600", marginTop: 4 }}>
                Queued
              </Text>
            </View>
            
            <View style={{ 
              width: "48%", 
              backgroundColor: colors.cardBg2, 
              borderRadius: 16, 
              padding: 14,
              alignItems: "center"
            }}>
              <Text style={{ color: colors.success, fontSize: 24, fontWeight: "700" }}>
                {syncStats.completedItems}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600", marginTop: 4 }}>
                Completed
              </Text>
            </View>
            
            {/* <View style={{ 
              width: "31%", 
              backgroundColor: colors.cardBg3, 
              borderRadius: 16, 
              padding: 14, 
              alignItems: "center"
            }}>
              <Text style={{ color: colors.warning, fontSize: 24, fontWeight: "700" }}>
                {syncStats.totalCacheSize}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "600", marginTop: 4 }}>
                Cache Size
              </Text>
            </View> */}
          </View>
        </View>
        
        {/* Asset Management Section */}
        <View style={{ 
          backgroundColor: colors.white,
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 24,
          ...cardShadow
        }}>
          <Text style={{ 
            color: colors.primary, 
            fontSize: 18, 
            fontWeight: "700",
            marginBottom: 20
          }}>
            Asset Management
          </Text>
          
          {/* Asset Dropdown */}
          
          {/* Dropdown Menu */}
            <View style={{ 
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              marginBottom: 20,
              overflow: "hidden",
              ...cardShadow
            }}>
              {/* Search input */}
              <View style={{ 
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}>
                <Feather name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{ 
                    flex: 1,
                    fontSize: 14,
                    color: colors.textPrimary,
                    paddingVertical: 8,
                  }}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              
              {/* Assets list */}
              {assets?.length > 0 ? (
                <FlatList
                  data={assets}
                  keyExtractor={(item) => item._ID}
                  scrollEnabled={false}
                  style={{ maxHeight: 200 }}
                  renderItem={({ item }) => (
                    <Pressable
                      style={{ 
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      }}
                      onPress={() => addAsset(item)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "500" }}>
                          {item.Name}
                        </Text>
                      </View>
                      <Feather name="plus-circle" size={20} color={colors.accent} />
                    </Pressable>
                  )}
                />
              ) : (
                <View style={{ padding: 16, alignItems: "center" }}>
                  <Text style={{ color: colors.textSecondary }}>No matching assets found</Text>
                </View>
              )}
            </View>
        
          
          {/* Selected Assets List */}
          <Text style={{ 
            color: colors.textPrimary, 
            fontSize: 15, 
            fontWeight: "600",
            marginBottom: 12
          }}>
            Selected Assets
          </Text>
          
          {selectedAssets?.length > 0 ? (
            selectedAssets.map((asset) => (
              <View 
                key={asset.id} 
                style={{ 
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.cardBg4,
                  marginBottom: 10,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <View style={{ 
                  backgroundColor: colors.white,
                  borderRadius: 10,
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}>
                  <Feather 
                    name={
                      asset.type === "Equipment" ? "box" : 
                      asset.type === "System" ? "cpu" : 
                      "box"
                    } 
                    size={18} 
                    color={colors.purple} 
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: "600" }}>
                    {asset.Name}
                  </Text>
                
                </View>
                
                <View style={{ flexDirection: "row" }}>
                  <Pressable
                    style={{ 
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.light,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    onPress={() => console.log("Refresh asset", asset.id)}
                  >
                    <Feather name="refresh-cw" size={16} color={colors.accent} />
                  </Pressable>
                  
                  <Pressable
                    style={{ 
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.light,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    onPress={() => removeAsset(asset.id)}
                  >
                    <Feather name="trash-2" size={16} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <View style={{ 
              padding: 20, 
              alignItems: "center", 
              borderRadius: 12,
              backgroundColor: colors.light,
              borderWidth: 1,
              borderColor: colors.border,
              borderStyle: "dashed"
            }}>
              <Feather name="inbox" size={24} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
                No assets selected for offline use
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Sync Now Button */}
      <View style={{ 
        position: "absolute", 
        bottom: 24, 
        left: 0, 
        right: 0, 
        paddingHorizontal: 20,
      }}>
        <Pressable
          onPress={handleSyncNow}
          disabled={isLoading}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 16,
            borderRadius: 16,
            backgroundColor: isLoading ? colors.textSecondary : colors.accent,
            ...cardShadow
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} style={{ marginRight: 10 }} />
          ) : (
            <Feather name="refresh-cw" size={18} color={colors.white} style={{ marginRight: 8 }} />
          )}
          
          <Text style={{ color: colors.white, fontWeight: "700", fontSize: 16 }}>
            {isLoading ? "Syncing..." : "Sync Now"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default OfflineSyncDashboard;