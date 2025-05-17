import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHome,
  faFolder,
  faPlus,
  faImage,
  faBars,
  faSearch,
  faList,
  faFileAlt,
  faBellConcierge,
  faQrcode,
  faBell,
  faFileLines,
} from '@fortawesome/free-solid-svg-icons';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const DashboardOptionScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [totalStorage, setTotalStorage] = useState({ used: 80, total: 150 });
  const [folderItems, setFolderItems] = useState(0);
  const { ppmAsstPermissions, ppmWorkorder } = usePermissions();

  // Calculate storage percentage
  const storagePercentage = Math.round((totalStorage.used / totalStorage.total) * 100);

  useEffect(() => {
    // Get user info from AsyncStorage
    const getUserInfo = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem('userInfo');
        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          setUserName(userInfo.data.user?.name || 'User');
          
          // Get some stats for the UI
          const workorderCount = await AsyncStorage.getItem('workOrderCount');
          setFolderItems(workorderCount ? parseInt(workorderCount) : 500);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    getUserInfo();
  }, []);

  // Folder data for the grid
  const folders = [
    {
      id: 1,
      name: 'Work Orders',
      created: '04/2020',
      size: 4,
      icon: faList,
      color: '#3454D1',
      onPress: () => navigation.navigate('WorkOrderHomeTab'),
    },
    {
      id: 2,
      name: 'Service Requests',
      created: '03/2020',
      size: 2,
      icon: faBellConcierge,
      color: '#4CAF50',
      onPress: () => navigation.navigate('ServiceRequests'),
    },
    {
      id: 3,
      name: 'Scanner',
      created: '02/2020',
      size: 5,
      icon: faQrcode,
      color: '#FFC107',
      onPress: () => navigation.navigate('QRCode'),
    },
    {
      id: 4,
      name: 'Notifications',
      created: '02/2020',
      size: 12,
      icon: faBell,
      color: '#FF5722',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      id: 5,
      name: 'Future WOs',
      created: '01/2020',
      size: 10,
      icon: faFileLines,
      color: '#2196F3',
      onPress: () => navigation.navigate('FutureWorkOrders'),
    },
    {
      id: 6,
      name: 'My WOs',
      created: '12/2019',
      size: 50,
      icon: faFileAlt,
      color: '#607D8B',
      onPress: () => navigation.navigate('MyWorkOrders'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f6fa" />
      
      {/* Header with Welcome message */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeTitle}>Hi {userName.split(' ')[0]}!</Text>
          <Text style={styles.welcomeSubtitle}>Welcome Back.</Text>
        </View>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/50' }} 
            style={styles.profileImage} 
          />
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your files"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.searchButton}>
          <FontAwesomeIcon icon={faSearch} size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Storage overview */}
      <View style={styles.storageContainer}>
        <View style={styles.storageCircleContainer}>
          <View style={styles.storageCircleOuter}>
            <View style={styles.storageCircleInner}>
              <Text style={styles.storagePercentage}>{storagePercentage}%</Text>
            </View>
          </View>
        </View>
        <View style={styles.storageInfo}>
          <Text style={styles.storageTitle}>Total Used</Text>
          <Text style={styles.storageDetails}>
            {totalStorage.used} GB/{totalStorage.total} GB
          </Text>
        </View>
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsCount}>{folderItems}</Text>
          <Text style={styles.itemsLabel}>Items</Text>
        </View>
      </View>

      {/* Recently Created Section */}
      <Text style={styles.sectionTitle}>Recently Created Folder</Text>

      {/* Grid of folders */}
      <ScrollView style={styles.folderScrollView}>
        <View style={styles.folderGrid}>
          {folders.map((folder) => (
            <TouchableOpacity 
              key={folder.id} 
              style={styles.folderCard}
              onPress={folder.onPress}
            >
              <View style={styles.folderCardContent}>
                <Text style={styles.folderName}>{folder.name}</Text>
                <Text style={styles.folderDate}>Created {folder.created}</Text>
                <View style={styles.folderSizeContainer}>
                  <Text style={styles.folderSize}>{folder.size}</Text>
                  <Text style={styles.folderSizeUnit}>{folder.size > 1 ? 'Items' : 'Item'}</Text>
                </View>
              </View>
              <View style={[styles.folderIconContainer, { backgroundColor: folder.color }]}>
                <FontAwesomeIcon icon={folder.icon} size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesomeIcon icon={faHome} size={24} color="#3454D1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesomeIcon icon={faFolder} size={24} color="#9E9E9E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton}>
          <FontAwesomeIcon icon={faPlus} size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesomeIcon icon={faImage} size={24} color="#9E9E9E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesomeIcon icon={faBars} size={24} color="#9E9E9E" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#222',
  },
  welcomeSubtitle: {
    fontSize: 20,
    color: '#9E9E9E',
    marginTop: 5,
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#616161',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: '#3454D1',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  storageContainer: {
    flexDirection: 'row',
    backgroundColor: '#3454D1',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  storageCircleContainer: {
    width: 70,
    height: 70,
    marginRight: 20,
  },
  storageCircleOuter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storageCircleInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storagePercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3454D1',
  },
  storageInfo: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  storageDetails: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  itemsContainer: {
    alignItems: 'flex-end',
  },
  itemsCount: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  itemsLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  folderScrollView: {
    flex: 1,
  },
  folderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  folderCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  folderCardContent: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  folderDate: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 3,
    marginBottom: 15,
  },
  folderSizeContainer: {
    marginTop: 'auto',
  },
  folderSize: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  folderSizeUnit: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  folderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3454D1',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    paddingHorizontal: 20,
  },
  navItem: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3454D1',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardOptionScreen;