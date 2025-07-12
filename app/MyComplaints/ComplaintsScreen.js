import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import ComplaintCard from './ComplaintCard';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import FilterOptions from '../WorkOrders/WorkOrderFilter';
import { usePermissions } from '../GlobalVariables/PermissionsContext';
import Loader from '../LoadingScreen/AnimatedLoader';
import { complaintService } from '../../services/apis/complaintApis';

// Animated Complaint Card Component
const AnimatedComplaintCard = ({ data, category, nightMode, locations, isRemoving, onRemoveComplete }) => {
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
      <ComplaintCard 
        data={data} 
        categroy={category} 
        nightMode={nightMode} 
        locations={locations} 
      />
    </Animated.View>
  );
};

// New Item Indicator Component
const NewItemIndicator = ({ isVisible, nightMode }) => {
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
          backgroundColor: nightMode ? '#2D5016' : '#E8F5E8',
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <FontAwesome name="plus-circle" size={16} color="#4CAF50" />
      <Text style={[styles.newItemText, { color: nightMode ? '#A5D6A7' : '#4CAF50' }]}>
Complaints Refreshed
      </Text>
    </Animated.View>
  );
};

const ComplaintsScreen = ({route}) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [showNewItemIndicator, setShowNewItemIndicator] = useState(false);
  const {refresh}  = route.params || {}
  const navigation = useNavigation();
  const { complaintPermissions, complaintFilter, setComplaintFilter, nightMode } = usePermissions();

  const colors = {
    background: nightMode ? '#121212' : '#f9f9f9',
    card: nightMode ? '#1e1e1e' : '#fff',
    text: nightMode ? '#f8f9fa' : '#074B7C',
    textMuted: nightMode ? '#aaa' : '#999',
    button: '#074B7C',
    disabledButton: '#B0B0B0',
    whiteText: '#fff',
  };

  const getComplaintId = (complaint) => {
    return complaint.id?.toString() || complaint.complaintId?.toString() || JSON.stringify(complaint);
  };

  const compareComplaints = (oldComplaints, newComplaints) => {
    const oldIds = new Set(oldComplaints.map(getComplaintId));
    const newIds = new Set(newComplaints.map(getComplaintId));
    
    const removedIds = [...oldIds].filter(id => !newIds.has(id));
    const addedComplaints = newComplaints.filter(complaint => !oldIds.has(getComplaintId(complaint)));
    
    return { removedIds, addedComplaints };
  };

  const handleDataUpdate = useCallback((newData) => {
    if (isInitialLoad) {
      setComplaints(newData);
      return;
    }

    const { removedIds, addedComplaints } = compareComplaints(complaints, newData);

    // Handle removed items with animation
    if (removedIds.length > 0) {
      setRemovingItems(new Set(removedIds));
      
      // After animation completes, update the data
      setTimeout(() => {
        setComplaints(newData);
        setRemovingItems(new Set());
      }, 300);
    } else {
      // No items removed, just update normally
      setComplaints(newData);
    }

    // Show indicator for new items
    if (addedComplaints.length > 0 && !isInitialLoad) {
      setShowNewItemIndicator(true);
      setTimeout(() => setShowNewItemIndicator(false), 3000);
    }
  }, [complaints, isInitialLoad]);

  const fetchComplaints = useCallback(async () => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      
      const response = await complaintService.getAllComplaints();
      handleDataUpdate(response.data || []);
    } catch {
      if (isInitialLoad) {
        setComplaints([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsInitialLoad(false);
    }
  }, [handleDataUpdate, isInitialLoad]);

  const fetchLocations = async () => {
    try {
      const response = await complaintService.getComplaintLocations();
      setLocations(response);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await complaintService.getComplaintCategories();
      if (response?.data) {
        setCategories(Object.values(response.data));
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  }, []);

useFocusEffect(
  useCallback(() => {
    fetchComplaints();
  }, [])
);


  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, [fetchCategories]);

  // Update filter handling to reset initial load state
  const handleFilterChange = (status) => {
    setComplaintFilter(status);
    setShowFilter(false);
    // Don't reset isInitialLoad for filter changes
    // setIsInitialLoad(true);
    // fetchComplaints();
  };

  const filteredComplaintsMemoized = useMemo(() => {
    if (complaintFilter === 'All') return complaints;
    else if(complaintFilter === "Open"){
      return complaints?.filter((c) => c.status.toLowerCase() === 'open');
    }
    return complaints?.filter((c) => c.status.toLowerCase() === complaintFilter.toLowerCase());
  }, [complaints, complaintFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const renderComplaintItem = ({ item }) => {
    const itemId = getComplaintId(item);
    const isRemoving = removingItems.has(itemId);
    
    return (
      <AnimatedComplaintCard
        data={item}
        category={categories}
        nightMode={nightMode}
        locations={locations}
        isRemoving={isRemoving}
        onRemoveComplete={() => {
          // This will be called when animation completes
        }}
      />
    );
  };

  if (loading && isInitialLoad) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Loader />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading complaints...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.button }]}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilter(!showFilter)}
        >
          <FontAwesome name="filter" size={18} color={colors.whiteText} />
          <Text style={[styles.filterText, { color: colors.whiteText }]}>Filter</Text>
        </TouchableOpacity>

        <View>
          <Text
            style={[
              styles.selectedStatus,
              {
                backgroundColor: nightMode ? '#333' : '#e0e0e0',
                color: colors.text,
              },
            ]}
          >
            {complaintFilter.toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('RaiseComplaint')}
          disabled={!complaintPermissions.some((p) => p.includes('C'))}
          style={[
            styles.addButton,
            {
              backgroundColor: complaintPermissions.some((p) => p.includes('C'))
                ? colors.button
                : colors.disabledButton,
            },
          ]}
        >
          <FontAwesome name="plus" size={18} color={colors.whiteText} />
          <Text style={[styles.addButtonText, { color: colors.whiteText }]}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* New Item Indicator */}
      <NewItemIndicator isVisible={showNewItemIndicator} nightMode={nightMode} />

      {/* Filter Options */}
      {showFilter && (
        <FilterOptions
          filters={[
            'All',
            'Open',
            'Hold',
            'Cancelled',
            'WIP',
            'Closed',
            'Reopen',
            'Completed',
            'Resolved',
            'Working',
          ]}
          selectedFilter={complaintFilter}
          applyFilter={handleFilterChange}
          closeFilter={() => setShowFilter(false)}
        />
      )}

      {/* List or Empty State */}
      <FlatList
        data={filteredComplaintsMemoized}
        keyExtractor={(item) => getComplaintId(item)}
        renderItem={renderComplaintItem}
        ListEmptyComponent={() => (
          <View style={styles.noComplaintsContainer}>
            {complaintPermissions.some((p) => p.includes('R')) ? (
              <>
                <FontAwesome name="exclamation-circle" size={30} color={colors.textMuted} />
                <Text style={[styles.noComplaintsText, { color: colors.textMuted }]}>
                  No Complaints Found
                </Text>
              </>
            ) : (
              <Text style={{ color: colors.text }}>Not Authorized to view complaints</Text>
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        removeClippedSubviews={false} // Prevent issues with animations
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  noComplaintsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noComplaintsText: {
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  filterText: {
    marginLeft: 8,
    fontSize: 16,
  },
  selectedStatus: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  newItemIndicator: {
    position: 'absolute',
    top: 80,
    right: 20,
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
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default ComplaintsScreen;