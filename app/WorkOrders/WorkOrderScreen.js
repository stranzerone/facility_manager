import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FilterOptions from './WorkOrderFilter';
import WorkOrderCard from './WorkOrderCards';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Loader from '../LoadingScreen/AnimatedLoader';
import { fetchAllUsers } from '../../utils/Slices/UsersSlice';
import { fetchAllTeams } from '../../utils/Slices/TeamSlice';
import { useDispatch, useSelector } from 'react-redux';
import { usePermissions } from '../GlobalVariables/PermissionsContext';
import { workOrderService } from "../../services/apis/workorderApis";

// Colors based on nightMode
const getColors = (nightMode) => ({
  header: nightMode ? '#2D3748' : '#074B7C',
  background: nightMode ? '#121212' : '#eceff1',
  card: nightMode ? '#1e1e1e' : '#ffffff',
  text: nightMode ? 'gray' : '#074B7C',
  icon: nightMode ? '#f8f9fa' : '#074B7C',
  button: nightMode ? '#2a2a2a' : '#f8f9fa',
  filterBg: nightMode ? '#333' : '#f8f9fa',
  noDataIcon: nightMode ? '#f8f9fa' : '#074B7C',
  whiteText: '#ffffff',
});

// Animated Work Order Card Component
const AnimatedWorkOrderCard = ({ workOrder, previousScreen, uuid, isRemoving, onRemoveComplete }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRemoving) {
      // Animate card sliding out to the left
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -400, // Slide to left
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onRemoveComplete?.();
      });
    }
  }, [isRemoving]);

  return (
    <Animated.View
      style={{
        transform: [{ translateX: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <WorkOrderCard 
        workOrder={workOrder} 
        previousScreen={previousScreen} 
        uuid={uuid} 
      />
    </Animated.View>
  );
};

// New Item Indicator Component
const NewItemIndicator = ({ isVisible }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 3 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 3000);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.newItemIndicator,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Icon name="plus-circle" size={16} color="#4CAF50" />
      <Text style={styles.newItemText}>Refreshed List</Text>
    </Animated.View>
  );
};

const WorkOrderPage = ({ route }) => {
  const qrValue = route?.params?.qrValue || null;
  const type = route?.params?.ScreenType || "OW";
  const wotype = route?.params?.wotype || null;
  const screenType = route?.params?.params?.screenType || "OW";

  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('OPEN');
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [inputNumber, setInputNumber] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [flag, setFlag] = useState(false);
  const [pageNo, setPageNo] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [showNewItemIndicator, setShowNewItemIndicator] = useState(false);
const prevQrValueRef = useRef(null);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.data);
  const teams = useSelector((state) => state.teams.data);
  const { ppmAsstPermissions, ppmWorkorder, nightMode } = usePermissions();
  const colors = getColors(nightMode);

  useEffect(() => {
    if (!users?.length || !teams?.length) {
      dispatch(fetchAllTeams());
      dispatch(fetchAllUsers());
    }
  }, []);

  const getWorkOrderId = (workOrder) => {
    return workOrder.wo?.['Sequence No'] || workOrder.id || JSON.stringify(workOrder);
  };

  const compareWorkOrders = (oldOrders, newOrders) => {
    const oldIds = new Set(oldOrders.map(getWorkOrderId));
    const newIds = new Set(newOrders.map(getWorkOrderId));
    
    const removedIds = [...oldIds].filter(id => !newIds.has(id));
    const addedOrders = newOrders.filter(order => !oldIds.has(getWorkOrderId(order)));
    
    return { removedIds, addedOrders };
  };

  const fetchData = async (page = 0, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else if (isInitialLoad) {
      setLoading(true);
    }

    try {
      let response = null;
      if (qrValue) {
        switch (screenType) {
          case "OW":
            if (wotype === "AS") {
              const bd = await workOrderService.getAssetWorkOrder(qrValue, selectedFilter, true, page);
              const wo = await workOrderService.getAssetWorkOrder(qrValue, selectedFilter, false, page);
              const merged = [...wo.data, ...bd.data];
              
              if (isLoadMore) {
                setWorkOrders(prev => [...prev, ...merged]);
              } else {
                handleDataUpdate(merged || []);
              }
              
              setHasMoreData(merged.length === 10);
            } else {
              const bd = await workOrderService.getLocationWorkOrder(qrValue, selectedFilter, true, page);
              const wo = await workOrderService.getLocationWorkOrder(qrValue, selectedFilter, false, page);
              const merged = [...wo.data, ...bd.data];
              
              if (isLoadMore) {
                setWorkOrders(prev => [...prev, ...merged]);
              } else {
                handleDataUpdate(merged || []);
              }
              
              setHasMoreData(merged.length === 10);
            }
            break;
          case "ME":
            response = await getEscalations(page);
            break;
        }
        if (response) {
          if (isLoadMore) {
            setWorkOrders(prev => [...prev, ...(response || [])]);
          } else {
            handleDataUpdate(response || []);
          }
          setHasMoreData(response?.length === 10 || response?.length === 20);
        }
      } else {
        if (screenType === "OW") {
          response = await workOrderService.getAllWorkOrders(selectedFilter, flag, page);
          if (isLoadMore) {
            setWorkOrders(prev => [...prev, ...(response.data || [])]);
          } else {
            handleDataUpdate(response.data || []);
          }
          
          setHasMoreData(response.data?.length === 20);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
      setIsInitialLoad(false);
    }
  };

  const handleDataUpdate = (newData) => {
    if (isInitialLoad) {
      setWorkOrders(newData);
      return;
    }

    const { removedIds, addedOrders } = compareWorkOrders(workOrders, newData);

    // Handle removed items with animation
    if (removedIds.length > 0) {
      setRemovingItems(new Set(removedIds));
      
      // After animation completes, update the data
      setTimeout(() => {
        setWorkOrders(newData);
        setRemovingItems(new Set());
      }, 300);
    } else {
      // No items removed, just update normally
      setWorkOrders(newData);
    }

    // Show indicator for new items
    if (addedOrders.length > 0 && !isInitialLoad) {
      setShowNewItemIndicator(true);
      setTimeout(() => setShowNewItemIndicator(false), 3000);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setPageNo(0);
      setHasMoreData(true);
      fetchData(0, false);
    }, [qrValue, wotype, flag, selectedFilter])
  );
useEffect(() => {
  if (prevQrValueRef.current !== qrValue) {
    prevQrValueRef.current = qrValue;
    setLoading(true); // Show loader
    setWorkOrders([]); // Clear old data
    setPageNo(0);
    setHasMoreData(true);
    setIsInitialLoad(true);
    fetchData(0, false);
  }
}, [qrValue]);


  const permissionToAdd =
    ppmWorkorder.some((p) => p.includes('C')) &&
    (ppmAsstPermissions?.some((p) => p.includes('R')) || qrValue);

  const applyFilter = (filter) => {
    setSelectedFilter(filter);
    setFilterVisible(false);
    setPageNo(0);
    setHasMoreData(true);
    setIsInitialLoad(true); // Reset initial load state for new filter
  };

  const filteredWorkOrders =
    screenType !== "UW" && inputNumber
      ? workOrders?.filter((order) =>
          order.wo['Sequence No'].includes(inputNumber)
        )
      : workOrders;

  const onRefresh = () => {
    setRefreshing(true);
    setPageNo(0);
    setHasMoreData(true);
    fetchData(0, false);
  };

  const toggleFlag = () => {
    setFlag((prev) => !prev);
    setPageNo(0);
    setHasMoreData(true);
    setIsInitialLoad(true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMoreData && workOrders.length > 0) {
      const nextPage = pageNo + 1;
      setPageNo(nextPage);
      fetchData(nextPage, true);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.icon} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading more...</Text>
      </View>
    );
  };

  const renderWorkOrderItem = ({ item, index }) => {
    const itemId = getWorkOrderId(item);
    const isRemoving = removingItems.has(itemId);
    
    return (
      <AnimatedWorkOrderCard
        workOrder={item}
        previousScreen="Work Orders"
        uuid={qrValue}
        isRemoving={isRemoving}
        onRemoveComplete={() => {
          // This will be called when animation completes
        }}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View className="flex flex-row items-center justify-between p-3 mt-1 rounded-md shadow-md"
        style={{ backgroundColor: colors.header }}>
        {/* Left: Flag & Filter */}
        <View className="flex flex-row items-center space-x-3">
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.button, borderColor: 'gray' }]}
            onPress={toggleFlag}
          >
            <Icon name="flag" size={17} color={flag ? 'red' : colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            style={[styles.button, { backgroundColor: colors.filterBg }]}
          >
            <Icon name="filter" size={17} color={colors.icon} />
            <Text style={{ color: colors.icon, marginLeft: 5 }}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Center: Status */}
        <Text style={{ color: colors.whiteText, fontWeight: '600', fontSize: 18 }}>{selectedFilter}</Text>

        {/* Right: Add Button */}
        {ppmWorkorder.some((p) => p.includes('C')) && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddWo', {
                qr: "no",
                type: null,
                screenType,
                uuid: qrValue,
              })
            }
            disabled={!permissionToAdd}
            style={[
              styles.button,
              {
                backgroundColor: permissionToAdd ? '#fff' : '#ccc',
                flexDirection: 'row',
              },
            ]}
          >
            <Icon name="plus" size={17} color={permissionToAdd ? '#074B7C' : 'gray'} />
            <Text style={{ marginLeft: 5, color: permissionToAdd ? '#074B7C' : 'gray' }}>
              Add
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* New Item Indicator */}
      <NewItemIndicator isVisible={showNewItemIndicator} />

      {loading && isInitialLoad ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : filteredWorkOrders.length === 0 ? (
        <View style={styles.noRecordsContainer}>
          <Icon name="exclamation-circle" size={50} color={colors.noDataIcon} />
          <Text style={[styles.noRecordsText, { color: colors.noDataIcon }]}>No Work Order Found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredWorkOrders}
          keyExtractor={(item, index) => `${getWorkOrderId(item)}-${index}`}
          renderItem={renderWorkOrderItem}
          contentContainerStyle={styles.contentContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          removeClippedSubviews={false} // Prevent issues with animations
        />
      )}

      {/* Filter Modal */}
      {filterVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={filterVisible}
          onRequestClose={() => setFilterVisible(false)}
        >
          <FilterOptions
            filters={['OPEN', 'STARTED', 'COMPLETED', 'HOLD', 'CANCELLED', 'REOPEN']}
            selectedFilter={selectedFilter}
            applyFilter={applyFilter}
            closeFilter={() => setFilterVisible(false)}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecordsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 30,
    alignItems: 'center',
  },
  noRecordsText: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  newItemIndicator: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newItemText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default WorkOrderPage;