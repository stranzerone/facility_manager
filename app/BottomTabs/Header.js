import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { usePermissions } from '../GlobalVariables/PermissionsContext';
import { workOrderService } from '../../services/apis/workorderApis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { clearAllTeams, fetchAllTeams } from '../../utils/Slices/TeamSlice';
import { clearAllUsers, fetchAllUsers } from '../../utils/Slices/UsersSlice';
import { useNavigation } from '@react-navigation/native';

const Header = ({  siteLogo,user }) => {
const {nightMode,setNightMode}  = usePermissions()
  const isDark = nightMode;
  const navigation = useNavigation()
  console.log(user.name,'this is user on head')
const dispatch = useDispatch()
    const handleLogout = async () => {
    try {
      await workOrderService.appUnrigester()
      await AsyncStorage.removeItem('userInfo');
       const teams =   await dispatch(clearAllTeams())
 
      await dispatch(clearAllUsers())
      navigation.replace("Login");

    } catch (error) {
      console.error('Error clearing local storage', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };
  return (
    <View style={[styles.headerContainer, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      {/* Left side - Logo and App Name */}
      <View style={styles.leftSection}>
        {siteLogo ? (
          <Image
            source={{ uri: siteLogo }}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: '#1996D3' }]}>
            <Text style={styles.logoText}>A</Text>
          </View>
        )}
        <Text style={[styles.appName, { color: isDark ? '#FFFFFF' : '#374151' }]}>
          {user.name || "site"}
        </Text>
      </View>

      {/* Right side - Theme toggle and logout */}
      <View style={styles.rightSection}>
        {/* Night mode toggle */}
        <TouchableOpacity 
          style={[styles.toggleButton, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
          onPress={()=>setNightMode(!nightMode)}
        >
          <Icon 
            name={isDark ? "sun-o" : "moon-o"} 
            size={16} 
            color={isDark ? '#F59E0B' : '#6B7280'} 
          />
        </TouchableOpacity>

        {/* Logout button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="power-off" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 64,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;