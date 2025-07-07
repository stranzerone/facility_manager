import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import IRCard from "./IRcard"; // adjust path if needed
import OptionsModal from "../../DynamivPopUps/DynamicOptionsPopUp"; // adjust path if needed
import { usePermissions } from "../../GlobalVariables/PermissionsContext";
import Loader from "../../LoadingScreen/AnimatedLoader";
import { InventoryServices } from "../../../services/apis/InventoryApi";

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const IRItemsScreen = ({ route }) => {
  const navigation = useNavigation();
  const uuid = route?.params?.uuid || null;
  const [irItems, setIrItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [animatedItems, setAnimatedItems] = useState(new Map());
  
  const { nightMode, issueRequestPermission } = usePermissions();
  const permissionToAdd = issueRequestPermission.some((permission) =>
    permission.includes("C")
  );

  // Theme colors based on night mode
  const themeStyles = {
    background: nightMode ? '#1F2937' : '#F1F5F9',
    cardBackground: nightMode ? '#374151' : '#FFFFFF',
    textPrimary: nightMode ? '#F9FAFB' : '#000000',
    textSecondary: nightMode ? '#D1D5DB' : '#6B7280',
    textMuted: nightMode ? '#9CA3AF' : '#94A3B8',
    border: nightMode ? '#4B5563' : '#E5E7EB',
    accent: '#074B7C',
    shadow: nightMode ? '#000000' : '#00000010',
  };

  // Custom layout animation configurations
  const customLayoutAnimation = {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  };

  const filterByStatus = (items, status) => {
    if (status === "ALL") {
      return items.filter((item) => item && item.issue);
    }
    return items.filter((item) => item && item.issue?.Status === status);
  };

  const compareItems = (oldItems, newItems) => {
    const oldIds = new Set(oldItems.map(item => item.issue?.id));
    const newIds = new Set(newItems.map(item => item.issue?.id));
    
    const addedItems = newItems.filter(item => !oldIds.has(item.issue?.id));
    const removedItems = oldItems.filter(item => !newIds.has(item.issue?.id));
    
    return { addedItems, removedItems };
  };

  const animateItemChanges = (oldItems, newItems) => {
    const { addedItems, removedItems } = compareItems(oldItems, newItems);
    
    if (addedItems.length > 0 || removedItems.length > 0) {
      // Configure layout animation
      LayoutAnimation.configureNext(customLayoutAnimation);
      
      // Create animated values for new items
      const newAnimatedItems = new Map(animatedItems);
      
      // Add fade-in animation for new items
      addedItems.forEach(item => {
        const fadeAnim = new Animated.Value(0);
        const scaleAnim = new Animated.Value(0.8);
        newAnimatedItems.set(item.issue?.id, { fadeAnim, scaleAnim });
        
        // Animate in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      });
      
      // Remove animated values for removed items
      removedItems.forEach(item => {
        newAnimatedItems.delete(item.issue?.id);
      });
      
      setAnimatedItems(newAnimatedItems);
    }
  };

  const fetchData = async (showLoadingSpinner = false) => {
    if (showLoadingSpinner) {
      setLoading(true);
    }
    
    try {
      const response = await InventoryServices.getAllIssueRequests(uuid);
      const allItems = response.data || [];
      
      // Compare with previous items for animation
      if (!isInitialLoad && irItems.length > 0) {
        const oldFiltered = filterByStatus(irItems, selectedStatus);
        const newFiltered = filterByStatus(allItems, selectedStatus);
        animateItemChanges(oldFiltered, newFiltered);
      }
      
      setIrItems(allItems);
      const filtered = filterByStatus(allItems, selectedStatus);
      setFilteredItems(filtered);
      
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message || error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch fresh data every time screen is focused
  useFocusEffect(
    useCallback(() => {
      // Only show loading spinner on initial load
      fetchData(isInitialLoad);
    }, [selectedStatus, uuid])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(false); // Don't show loading spinner on refresh
  };

  const handleFilterChange = (status) => {
    setSelectedStatus(status);
    
    // Animate filter change
    LayoutAnimation.configureNext(customLayoutAnimation);
    const filtered = filterByStatus(irItems, status);
    setFilteredItems(filtered);
    setShowOptionsModal(false);
  };

  const statusOptions = [
    { label: "All", value: "ALL", icon: "list" },
    { label: "Pending", value: "PENDING", icon: "clock-o" },
    { label: "Approved", value: "APPROVED", icon: "check" },
    { label: "Declined", value: "DECLINED", icon: "times-circle" },
    { label: "Draft", value: "DRAFT", icon: "file-o" },
    { label: "Cancelled", value: "CANCELLED", icon: "times-circle" },
  ];

  const renderHeader = () => (
    <View 
      className="flex-row items-center justify-between mb-4 pt-1 z-10 p-2"
      style={{ backgroundColor: themeStyles.background }}
    >
      <View className="flex-row gap-2 items-center justify-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 rounded-full shadow-sm"
          style={{ backgroundColor: themeStyles.cardBackground }}
        >
          <FontAwesome name="arrow-left" size={18} color={themeStyles.accent} />
        </TouchableOpacity>
        <Text 
          className="text-xl font-semibold"
          style={{ color: themeStyles.textPrimary }}
        >
          IR List
        </Text>
      </View>

      <View 
        className="flex-row items-center justify-center rounded-full p-2 mt-1"
        style={{ backgroundColor: themeStyles.cardBackground }}
      >
        <TouchableOpacity
          onPress={() => setShowOptionsModal(true)}
          className="flex-row items-center justify-center"
        >
          <Text 
            className="text-md font-semibold mr-1"
            style={{ color: themeStyles.textPrimary }}
          >
            {selectedStatus}
          </Text>
          <FontAwesome name="filter" size={18} color={themeStyles.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleCreateIR = () => {
    navigation.navigate("CreateIssueRequest", { uuid: uuid });
  };

  const renderAnimatedItem = ({ item, index }) => {
    if (!item || !item.issue) return null;
    
    const itemId = item.issue.id;
    const animatedValues = animatedItems.get(itemId);
    
    if (animatedValues) {
      // Render with animation for new items
      return (
        <Animated.View
          style={{
            opacity: animatedValues.fadeAnim,
            transform: [{ scale: animatedValues.scaleAnim }],
          }}
        >
          <IRCard item={item} uuid={uuid} nightMode={nightMode} />
        </Animated.View>
      );
    }
    
    // Render normally for existing items
    return <IRCard item={item} uuid={uuid} nightMode={nightMode} />;
  };

  return (
    <SafeAreaView 
      className="flex-1 px-4 pb-3"
      style={{ backgroundColor: themeStyles.background }}
    >
      {loading && isInitialLoad ? (
        <Loader />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item, index) => item.issue?.id?.toString() || index.toString()}
          renderItem={renderAnimatedItem}
          ListHeaderComponent={renderHeader}
          stickyHeaderIndices={[0]}
          contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={themeStyles.textSecondary}
              colors={[themeStyles.accent]}
            />
          }
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center mt-16 px-6">
              <FontAwesome 
                name="info-circle" 
                size={50} 
                color={themeStyles.textMuted} 
              />
              <Text 
                className="text-lg mt-4 font-medium text-center"
                style={{ color: themeStyles.textSecondary }}
              >
                No Issue Requests Found
              </Text>
              <Text 
                className="text-sm text-center mt-1"
                style={{ color: themeStyles.textSecondary }}
              >
                Pull down to refresh or try a different filter.
              </Text>
            </View>
          )}
          // Add smooth scrolling performance
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          getItemLayout={(data, index) => ({
            length: 150, // Approximate item height
            offset: 150 * index,
            index,
          })}
        />
      )}

      {/* Floating Button with subtle animation */}
      <Animated.View 
        className="absolute bottom-1 left-4 right-4"
        style={{
          transform: [
            {
              translateY: loading && isInitialLoad ? 100 : 0,
            },
          ],
        }}
      >
        <TouchableOpacity
          onPress={handleCreateIR}
          disabled={!permissionToAdd}
          className="py-4 rounded-2xl flex-row items-center justify-center shadow-lg"
          style={{ 
            backgroundColor: permissionToAdd ? themeStyles.accent : (nightMode ? '#4B5563' : '#9CA3AF'),
            opacity: permissionToAdd ? 1 : 0.6
          }}
        >
          <FontAwesome name="plus" size={16} color="#fff" />
          <Text className="text-white font-semibold ml-2">Create New IR</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Options Modal */}
      <OptionsModal
        visible={showOptionsModal}
        options={statusOptions}
        onSelect={handleFilterChange}
        onClose={() => setShowOptionsModal(false)}
        nightMode={nightMode}
      />
    </SafeAreaView>
  );
};

export default IRItemsScreen;