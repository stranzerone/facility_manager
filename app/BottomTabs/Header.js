import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { usePermissions } from '../GlobalVariables/PermissionsContext';
import { workOrderService } from '../../services/apis/workorderApis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { clearAllTeams } from '../../utils/Slices/TeamSlice'; // Assuming fetchAllTeams is not needed on logout
import { clearAllUsers } from '../../utils/Slices/UsersSlice'; // Assuming fetchAllUsers is not needed on logout
import { useNavigation } from '@react-navigation/native';

const Header = ({ siteLogo, user }) => {
  const { nightMode, setNightMode } = usePermissions();
  const isDark = nightMode;
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Ensure user object and user.name exist to prevent errors
  const userName = user?.name || "Site"; 
  // console.log(userName, 'this is user on head'); // Keep for debugging if needed



  return (
    <View style={styles.headerWrapper}>
      {/* Main Glass Background */}
      <View style={[
        styles.glassBackground,
        {
          backgroundColor: isDark 
            ? 'rgba(20, 20, 45, 0.96)' // Cosmic Night: Deep, dark desaturated blue/purple
            : 'rgba(240, 245, 255, 0.96)' // Morning Haze: Very light, cool off-white/pale blue
        }
      ]} />
      
      {/* Glass overlay effect */}
      <View style={[
        styles.glassOverlay,
        {
          backgroundColor: isDark 
            ? 'rgba(100, 70, 180, 0.1)'  // Cosmic Night: Lighter purple/magenta tint
            : 'rgba(170, 200, 240, 0.1)' // Morning Haze: Soft sky blue tint
        }
      ]} />

      {/* Subtle accent overlay */}
      <View style={[
        styles.accentOverlay,
        {
          backgroundColor: isDark 
            ? 'rgba(0, 180, 200, 0.07)' // Cosmic Night: Contrasting teal/cyan tint
            : 'rgba(250, 180, 190, 0.07)' // Morning Haze: Hint of warm pink/rose
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
              <View style={[styles.logoGlow, { 
                shadowColor: isDark ? '#8B5CF6' : '#60A5FA' // Adjusted glow for new bg
              }]} />
            </View>
          ) : (
            <View style={[
              styles.logoPlaceholder, 
              { 
                backgroundColor: isDark ? '#4F46E5' : '#3B82F6', // Indigo / Blue
                shadowColor: isDark ? '#8B5CF6' : '#60A5FA'  // Adjusted glow
              }
            ]}>
              <Text style={styles.logoText}>{userName.charAt(0).toUpperCase() || 'A'}</Text>
              <View style={[styles.logoGlow, { 
                shadowColor: isDark ? '#8B5CF6' : '#60A5FA' 
              }]} />
            </View>
          )}
          
          <View style={styles.appNameContainer}>
            <Text style={[
              styles.appName, 
              { 
                color: isDark ? '#E0E7FF' : '#111827', // Lighter for dark, darker for light
                // Text shadow can be subtle or removed if it clashes
                textShadowColor: isDark 
                  ? 'rgba(139, 92, 246, 0.2)' 
                  : 'rgba(59, 130, 246, 0.1)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 1
              }
            ]}>
              {userName}
            </Text>
            <View style={[
              styles.appNameUnderline,
              {
                backgroundColor: isDark ? '#8B5CF6' : '#60A5FA' // Violet / Blue
              }
            ]} />
          </View>
        </View>

        {/* Right side - Theme toggle and logout */}
        <View style={styles.rightSection}>
      

       <TouchableOpacity
       onPress={()=>navigation.navigate('More')}
  style={[
    {
      width: 38,
      height: 38,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#374151' : '#F3F4F6', // dark gray or light gray
      shadowColor: isDark ? '#000' : '#ccc',
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
      position: 'relative',
    },
  ]}
>
  <Icon name="user" size={20} color={isDark ? '#D1D5DB' : '#374151'} />
  <View
    style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: 999,
      backgroundColor: isDark ? '#4B5563' : '#E5E7EB',
      opacity: 0.15,
    }}
  />
</TouchableOpacity>

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    position: 'relative',
    height: Platform.OS === 'ios' ? 60 : 64, // Adjusted height for iOS status bar area
    paddingTop: Platform.OS === 'ios' ? 4 : 0, // Padding for iOS status bar
  },
  // gradientBackground: { // This style is defined but not used in the JSX
  //   position: 'absolute',
  //   top: 0, left: 0, right: 0, bottom: 0,
  //   zIndex: 1,
  // },
  glassBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1,
    // backdropFilter: 'blur(20px)', // backdropFilter is not standard in React Native
  },
  glassOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2,
    // backdropFilter: 'blur(10px)', // backdropFilter is not standard in React Native
  },
  // patternOverlay: { // This style is defined but not used in the JSX
  //   position: 'absolute',
  //   top: 0, left: 0, right: 0, bottom: 0,
  //   zIndex: 3, opacity: 0.4,
  //   backgroundImage: 'radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)',
  //   backgroundSize: '20px 20px',
  // },
  accentOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 3,
    // opacity: 0.6, // Opacity is handled by RGBA alpha
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
    borderBottomColor: 'rgba(156, 163, 175, 0.15)', // Slightly more visible border
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allow left section to take available space
    marginRight: 8, // Add some space before right section icons
  },
  logoContainer: {
    position: 'relative',
  },
  logo: {
    width: 38, // Slightly smaller
    height: 38,
    borderRadius: 8, // Softer corners
    borderWidth: 1.5, // Thinner border
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  logoPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowOffset: { width: 0, height: 2 }, // Softer shadow
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  logoGlow: {
    position: 'absolute',
    top: -2, left: -2, right: -2, bottom: -2, // Ensure glow covers the border
    borderRadius: 10, // Slightly larger than logo's borderRadius
    opacity: 0.4, // Adjusted opacity
    // shadowColor is set inline
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, // Stronger glow effect
    shadowRadius: 8,
    // elevation: 5, // Elevation on parent is enough
    zIndex: -1,
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  appNameContainer: {
    marginLeft: 12, // Slightly less margin
    position: 'relative',
    flexShrink: 1, // Allow app name to shrink if space is limited
  },
  appName: {
    fontSize: 18, // Slightly smaller for better fit
    fontWeight: '600', // Semibold
    letterSpacing: 0.25,
    // color and textShadow are set inline
  },
  appNameUnderline: {
    position: 'absolute',
    bottom: -3, // Adjusted position
    left: 0,
    height: 2,
    width: '50%', // Shorter underline
    borderRadius: 1,
    opacity: 0.7, // More visible
    // backgroundColor is set inline
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Slightly reduced gap
  },
  toggleButton: {
    width: 38, // Consistent size with logo
    height: 38,
    borderRadius: 19, // Fully rounded
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
    // backgroundColor, borderColor, shadowColor set inline
    shadowOffset: { width: 0, height: 1 }, // Softer shadow
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    position: 'relative',
    // backgroundColor, shadowColor set inline
    shadowOffset: { width: 0, height: 2 }, // Softer shadow
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGlow: {
    position: 'absolute',
    top: -1, left: -1, right: -1, bottom: -1,
    borderRadius: 20, // Match button's roundedness
    opacity: 0.25, // Adjusted glow opacity
    // backgroundColor is set inline
    // shadow properties are not typically needed for an inner glow effect like this
    zIndex: -1,
  },
});

export default Header;