import React, { useLayoutEffect, useState } from 'react';
import { SafeAreaView, View, TextInput, Image, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { loginApi } from '../../service/UserLoginApis/LoginApi';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import technicianImage from '../../assets/SvgImages/Technician.png';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
import UserCard from './MultipleUserCards/MultipleUserCards';
import { APP_VERSION } from '@env';
import { useDispatch } from 'react-redux';
import { fetchAllTeams } from '../../utils/Slices/TeamSlice';
import { Linking } from 'react-native';
import { RegisterAppOneSignal } from '../../service/OneSignalNotifications/RegisterOnesignal'

const NewLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [warningType, setWarningType] = useState(null);
  const [multipleUsers, setMultipleUsers] = useState([]);
  const [showUserCard, setShowUserCard] = useState(false);
  const navigation = useNavigation();

  const dispatch = useDispatch()
  useLayoutEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('userInfo');
      
        if (userInfo) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Home' }], 
            })
          );
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    checkLoginStatus();
  }, [navigation]);

  const register = async () => {
    try {
      await RegisterAppOneSignal();
    } catch (error) {
      console.error("Error registering OneSignal:", error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setPopupMessage('Email and Password are required.');
      setWarningType('warning');
      setPopupVisible(true);
      return;
    }

    try {
      setLoading(true);
      const data = { email, password };
      const response = await loginApi(data);
      if (response && response.status === 'success') {
        setEmail('');
        setPassword('');

 
      
        await register();
        dispatch(fetchAllTeams())
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        );
      } else if (Array.isArray(response.data) && response.data.length > 1) {
        setMultipleUsers(response.data);
        setShowUserCard(true);
      } else {
        setPopupMessage(response.message || 'Unknown error');
        setWarningType('error');
        setPopupVisible(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setPopupMessage('Login failed. Please try again.');
      setWarningType('error');
      setPopupVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user) => {
    setShowUserCard(false)
    try {
      setLoading(true);
      const data = { email, password, user };
      const response = await loginApi(data);

      if (response && response.status === 'success') {
        setEmail('');
        setPassword('');
      
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        );
      } else {
        setPopupMessage(response.message || 'Unknown error');
        setWarningType('error');
        setPopupVisible(true);
      }
    } catch (error) {
      console.error('Error logging in with selected user:', error);
      setPopupMessage('Login failed. Please try again.');
      setWarningType('error');
      setPopupVisible(true);
    } finally {
      setLoading(false);
      setShowUserCard(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={technicianImage}
          style={styles.imageBackground}
          resizeMode="contain"
        />
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://factech.co.in/fronts/images/Final_Logo_grey.png' }}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.formContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('OtpLogin')} style={styles.otpLoginLink}>
          <Text style={styles.otpLinkText}>Login with OTP</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Email Or Phone Number"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPasswordLink}>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity> */}


        <Text className='text-gray-500 text-center mt-10'>{APP_VERSION}</Text>
      </View>

{ Platform.OS === "ios"  &&     <View style={styles.bottomLinksContainer}>
  <TouchableOpacity onPress={() => Linking.openURL('http://app.factech.co.in/login')}>
    <Text style={styles.bottomLinkText}>Sign Up</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => Linking.openURL('https://factech.co.in/contact-us?from=ios-technician&refer=signup')}>
    <Text style={styles.bottomLinkText}>Contact Us</Text>
  </TouchableOpacity>
</View>}


      <DynamicPopup
        visible={popupVisible}
        message={popupMessage}
        onClose={() => setPopupVisible(false)}
        type={warningType}
        onOk={() => setPopupVisible(false)}
      />

      {showUserCard && (
        <UserCard
          visible={showUserCard}
          onClose={() => setShowUserCard(false)}
          users={multipleUsers}
          onSelectUser={handleUserSelect}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  headerContainer: {
    height: '30%',
    borderBottomLeftRadius: 200,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1996D3',
  },
  imageBackground: {
    position: 'relative',
    left: 140,
    height: '100%',
    width: '80%',
  },
  logoContainer: {
    height: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 40,
  },
  formContainer: {
    width: '100%',
    height: '50%',
    alignItems: 'center',
    justifyContent: 'start',
    paddingHorizontal: 20,
  },
  bottomLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  bottomLinkText: {
    color: '#1996D3',
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  
  otpLoginLink: {
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  otpLinkText: {
    textDecorationLine:"underline",
    color: '#074B7C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    width: Platform.OS === 'ios' ? '85%' : '100%',
    color: '#074B7C',
    padding: 12,
    marginBottom: 16,
    borderColor: '#1996D3',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  loginButton: {
    width: Platform.OS === 'ios' ? '80%' : '100%',
    padding: 14,
    backgroundColor: '#074B7C',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#074B7C',
  },
  loginButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  forgotPasswordLink: {
    marginTop: 8,
  },
  link: {
    color: '#074B7C',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NewLoginScreen;
