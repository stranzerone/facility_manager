import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationCard from './NotificationCard';
import Loader from '../LoadingScreen/AnimatedLoader';
import { complaintService } from '../../services/apis/complaintApis';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const NotificationMainPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
 const {nightMode}  = usePermissions()
  // Fetch notifications
  const initializeNotifications = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    else setRefreshing(true);

    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        const response = await complaintService.getMyNotifications();
        setNotifications(response?.data || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    initializeNotifications();
  }, []);

  const renderNotification = ({ item }) => (
    <NotificationCard message={item.message || 'No message available'} createdAt={item.created_at} />
  );

  return (
    <View 
        className={`${nightMode ? "bg-black" : "bg-white"}`}

    style={styles.container}>
      {loading ? (
  <View 
    className={`flex items-center justify-center flex-1 ${nightMode ? "bg-black" : "bg-white"}`}
  >
    <Loader />
  </View>

      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => initializeNotifications(true)} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No Notifications Present</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingBottom: 35,
  },
  listContainer: {
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 400, // Adjust based on screen size
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
});

export default NotificationMainPage;
