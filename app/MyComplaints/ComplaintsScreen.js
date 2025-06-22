import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import ComplaintCard from './ComplaintCard';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import FilterOptions from '../WorkOrders/WorkOrderFilter';
import { usePermissions } from '../GlobalVariables/PermissionsContext';
import Loader from '../LoadingScreen/AnimatedLoader';
import { complaintService } from '../../services/apis/complaintApis';

const ComplaintsScreen = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const navigation = useNavigation();
  const { complaintPermissions, complaintFilter, setComplaintFilter, nightMode } = usePermissions();
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState();

  const colors = {
    background: nightMode ? '#121212' : '#f9f9f9',
    card: nightMode ? '#1e1e1e' : '#fff',
    text: nightMode ? '#f8f9fa' : '#074B7C',
    textMuted: nightMode ? '#aaa' : '#999',
    button: '#074B7C',
    disabledButton: '#B0B0B0',
    whiteText: '#fff',
  };

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const response = await complaintService.getAllComplaints();
      setComplaints(response.data || []);
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, [fetchCategories]);

  const filteredComplaintsMemoized = useMemo(() => {
    if (complaintFilter === 'All') return complaints;
    return complaints?.filter((c) => c.status.toLowerCase() === complaintFilter.toLowerCase());
  }, [complaints, complaintFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  if (loading) {
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
          applyFilter={(status) => {
            setComplaintFilter(status);
            setShowFilter(false);
          }}
          closeFilter={() => setShowFilter(false)}
        />
      )}

      {/* List or Empty State */}
      <FlatList
        data={filteredComplaintsMemoized}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <ComplaintCard
            data={item}
            categroy={categories}
            nightMode={nightMode}
            locations={locations}
          />
        )}
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
});

export default ComplaintsScreen;
