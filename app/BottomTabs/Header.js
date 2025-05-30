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

const Header = ({ siteLogo, user }) => {
  const { nightMode, setNightMode } = usePermissions();
  const isDark = nightMode;
  const navigation = useNavigation();
  console.log(user.name, 'this is user on head');
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await workOrderService.appUnrigester();
      await AsyncStorage.removeItem('userInfo');
      await dispatch(clearAllTeams());
      await dispatch(clearAllUsers());
      navigation.replace("Login");
    } catch (error) {
      console.error('Error clearing local storage', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };

  return (
    <View style={styles.headerWrapper}>
      {/* Main Glass Background */}
      <View style={[
        styles.glassBackground,
        {
          backgroundColor: isDark 
            ? 'rgba(31, 41, 55, 0.92)' 
            : 'rgba(255, 255, 255, 0.92)'
        }
      ]} />
      
      {/* Glass overlay effect */}
      <View style={[
        styles.glassOverlay,
        {
          backgroundColor: isDark 
            ? 'rgba(99, 102, 241, 0.05)' 
            : 'rgba(59, 130, 246, 0.04)'
        }
      ]} />

      {/* Subtle accent overlay */}
      <View style={[
        styles.accentOverlay,
        {
          backgroundColor: isDark 
            ? 'rgba(139, 92, 246, 0.03)' 
            : 'rgba(16, 185, 129, 0.02)'
        }
      ]} />

      {/* Header Content */}
      <View style={styles.headerContainer}>
        
        {/* Left side - Logo and App Name */}
        <View style={styles.leftSection}>
          {siteLogo ? (
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: siteLogo }}
                style={styles.logo}
                resizeMode="contain"
              />
              {/* Logo glow effect */}
              <View style={[styles.logoGlow, { 
                shadowColor: isDark ? '#60A5FA' : '#3B82F6' 
              }]} />
            </View>
          ) : (
            <View style={[
              styles.logoPlaceholder, 
              { 
                backgroundColor: isDark ? '#3B82F6' : '#1996D3',
                shadowColor: isDark ? '#60A5FA' : '#3B82F6'
              }
            ]}>
              <Text style={styles.logoText}>A</Text>
              <View style={[styles.logoGlow, { 
                shadowColor: isDark ? '#60A5FA' : '#3B82F6' 
              }]} />
            </View>
          )}
          
          <View style={styles.appNameContainer}>
            <Text style={[
              styles.appName, 
              { 
                color: isDark ? '#F9FAFB' : '#1F2937',
                textShadowColor: isDark 
                  ? 'rgba(59, 130, 246, 0.3)' 
                  : 'rgba(255, 255, 255, 0.8)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2
              }
            ]}>
              {user.name || "site"}
            </Text>
            <View style={[
              styles.appNameUnderline,
              {
                backgroundColor: isDark ? '#60A5FA' : '#3B82F6'
              }
            ]} />
          </View>
        </View>

        {/* Right side - Theme toggle and logout */}
        <View style={styles.rightSection}>
          {/* Night mode toggle */}
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              { 
                backgroundColor: isDark 
                  ? 'rgba(75, 85, 99, 0.6)' 
                  : 'rgba(243, 244, 246, 0.8)',
                borderColor: isDark 
                  ? 'rgba(156, 163, 175, 0.2)' 
                  : 'rgba(209, 213, 219, 0.3)',
                shadowColor: isDark ? '#60A5FA' : '#3B82F6'
              }
            ]}
            onPress={() => setNightMode(!nightMode)}
          >
            <Icon 
              name={isDark ? "sun-o" : "moon-o"} 
              size={16} 
              color={isDark ? '#FBBF24' : '#6366F1'} 
            />
            <View style={[
              styles.buttonGlow,
              { backgroundColor: isDark ? '#FBBF24' : '#6366F1' }
            ]} />
          </TouchableOpacity>

          {/* Logout button */}
          <TouchableOpacity 
            onPress={handleLogout} 
            style={[
              styles.logoutButton,
              {
                backgroundColor: '#EF4444',
                shadowColor: '#EF4444'
              }
            ]}
          >
            <Icon name="power-off" size={16} color="white" />
            <View style={[styles.buttonGlow, { backgroundColor: '#EF4444' }]} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    position: 'relative',
    height: 64,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    backdropFilter: 'blur(20px)',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    backdropFilter: 'blur(10px)',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    opacity: 0.4,
    backgroundImage: 'radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  },
  accentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    opacity: 0.6,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.1)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    position: 'relative',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 12,
    opacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: -1,
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  appNameContainer: {
    marginLeft: 16,
    position: 'relative',
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  appNameUnderline: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    height: 2,
    width: '60%',
    borderRadius: 1,
    opacity: 0.6,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 21,
    opacity: 0.2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    zIndex: -1,
  },
});

export default Header;