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
import { GetMyComplaints } from '../../service/RaiseComplaintApis/GetMyComplaintApi';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import FilterOptions from '../WorkOrders/WorkOrderFilter';
import { usePermissions } from '../GlobalVariables/PermissionsContext';
import Loader from '../LoadingScreen/AnimatedLoader';
import { GetAllMyComplaints } from '../../service/ComplaintApis/GetMyAllComplaints';
import { readFromFile } from '../../offline/fileSystem/fileOperations';

const ComplaintsScreen = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const navigation = useNavigation();
  const { complaintPermissions, complaintFilter, setComplaintFilter } = usePermissions();
  const [categories, setCategories] = useState([]);

  // ✅ Memoize API calls to avoid redundant re-fetching
  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      
      // const response = await GetMyComplaints();
        const data = await readFromFile('myComplaints.json');
        const response = JSON.parse(data);

        console.log(response.data,'this is for complaints off')
      setComplaints(response.data || []);
    } catch (err) {
      setComplaints([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await GetAllMyComplaints();
      if (response?.data) {
        setCategories(Object.values(response.data));
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  }, []);

  // ✅ Fetch complaints only when filter changes
  useEffect(()=>{
      fetchComplaints();

  },[]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ✅ Memoize filtered complaints for better performance
  const filteredComplaintsMemoized = useMemo(() => {
    if (complaintFilter === 'All') return complaints;
    return complaints.filter((complaint) => complaint.status === complaintFilter);
  }, [complaints, complaintFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  // ✅ Show loader only when necessary
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader />
        <Text style={styles.loadingText}>Loading complaints...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header} className="bg-[#159BD2] p-3 rounded-sm">
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilter(!showFilter)}>
          <FontAwesome name="filter" size={18} color="#fff" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>

        <View style={styles.selectedStatusContainer}>
          <Text className="bg-gray-300 font-bold px-3 py-2 rounded-lg" style={styles.selectedStatus}>
            {complaintFilter.toUpperCase()}
          </Text>
        </View>

          <TouchableOpacity
          onPress={() => navigation.navigate('RaiseComplaint')}
          disabled={!complaintPermissions.some((permission) => permission.includes('C'))}
          style={[
            styles.addButton,
            { backgroundColor: complaintPermissions.some((permission) => permission.includes('C')) ? "#074B7C" : "#B0B0B0" }
          ]} >
                      <FontAwesome name="plus" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
    
      </View>

      {showFilter && (
       <FilterOptions
       filters={['All', 'Open', 'Hold', 'Cancelled', 'WIP', 'Closed', 'Reopen', 'Completed', 'Resolved', 'Working']}
       selectedFilter={complaintFilter}
       applyFilter={(status) => {
         setComplaintFilter(status);  // Update filter
         setShowFilter(false);        // Close modal
       }}
       closeFilter={() => setShowFilter(false)}
     />
     
      )}

      {filteredComplaintsMemoized.length === 0 ? (
        <View style={styles.noComplaintsContainer}>
          <FontAwesome name="exclamation-circle" size={30} color="#999" />
          <Text style={styles.noComplaintsText}>No Complaints Found</Text>
        </View>
      ) : complaintPermissions.some((permission) => permission.includes('R')) ? (
        <FlatList
          data={filteredComplaintsMemoized}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ComplaintCard data={item} categroy={categories} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <View style={styles.noComplaintsContainer}>
          <Text>Not Authorized to view complaints</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 70,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#074B7C',
    fontSize: 16,
    marginTop: 10,
  },
  noComplaintsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noComplaintsText: {
    color: '#999',
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#074B7C',
    padding: 10,
    borderRadius: 8,
  },
  filterText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  selectedStatusContainer: {
    flex: 1,
    alignItems: 'center',
  },
  selectedStatus: {
    color: '#074B7C',
    fontSize: 15,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#074B7C',
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default ComplaintsScreen;
