import React, { useState, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  
} from 'react-native';
import otpSvg from "../../../assets/SvgImages/otp.png";
import validateOtp from '../../../service/LoginWithOtp/ValidateOtpApi';
import { GetMyAccounts } from '../../../service/UserLoginApis/GetMyAccountsApi';
import { useNavigation } from '@react-navigation/native';
import DynamicPopup from '../../DynamivPopUps/DynapicPopUpScreen';
import UserCard from '../MultipleUserCards/MultipleUserCards';
import { LogMeInWithOtp } from '../../../service/LoginWithOtp/LoginMeInWithOtp';
import { usePermissions } from '../../GlobalVariables/PermissionsContext';

const OtpPage = ({ route }) => {
  const data = route.params.response.data;
  const [otp, setOtp] = useState(['', '', '', '']);
  const [activeInputIndex, setActiveInputIndex] = useState(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(data.try);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState({ type: '', message: '' });
  const [userCards, setUserCards] = useState([]);
  const [showUserCard, setShowUserCard] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false); 
  const navigation = useNavigation();
  const { nightMode } = usePermissions();
  
  // Create dynamic styles based on nightMode
  const dynamicStyles = createStyles(nightMode);

  const handleChangeText = useCallback((text, index) => {
    if (text.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = text;

    setOtp(newOtp);

    if (text && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  }, [otp]);

  const handleUserSelect = async (user) => {
    const response = await LogMeInWithOtp({ token: token, data: user });
    if (response.status === "success") {
      navigation.navigate('Home');
    }
  };

  const handleVerifyOtp = async () => {
   
    const otpString = otp.join('');
    if (otpString.length === 4) {
      setLoading(true);
      try {
        const response = await validateOtp(data.id, otpString);
        if (response.status === 'success') {
          setToken(response.data.token);
          const accountsResponse = await GetMyAccounts(response.data.token);
          if (accountsResponse && accountsResponse.status === 'success') {
            setUserCards(accountsResponse.data);
            setShowUserCard(true);
          } else {
            setPopupData({
              type: 'error',
              message: 'Failed to fetch accounts. Please try again.',
            });
            setPopupVisible(true);
          }
        } else {
          setPopupData({
            type: 'error',
            message: 'Invalid OTP. Please try again.',
          });
          setPopupVisible(true);
          setAttemptsRemaining((prev) => Math.max(prev - 1, 0));
          if(attemptsRemaining === 0){
            setPopupData({
              type: 'hint',
              message: 'You have exceeded the maximum number of attempts. Please try again after 15 min.',
            });
            setPopupVisible(true);

            navigation.navigate('Login');
          }
        }
      } catch (error) {
        setPopupData({
          type: 'error',
          message: 'Failed to verify OTP. Please try again later.',
        });
        setPopupVisible(true);
      }finally{
        setLoading(false);
      }
    } else {
      setPopupData({
        type: 'hint',
        message: 'Please enter a valid 4-digit OTP.',
      });
      setPopupVisible(true);
      setAttemptsRemaining((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={dynamicStyles.scrollViewContainer}>
          <View style={dynamicStyles.topContainer} />

          <View style={dynamicStyles.imageUriContainer}>
            <Image source={otpSvg} style={dynamicStyles.imageUri} resizeMode="contain" />
          </View>
          
          <View style={dynamicStyles.textContainer}>
            <Text style={dynamicStyles.headingOTP}>ENTER OTP</Text>
            <Text style={dynamicStyles.paraOTP}>
              Please enter the OTP sent to your phone number: {data.phoneNumber}
            </Text>
          </View>

          <View style={dynamicStyles.inputContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                style={[
                  dynamicStyles.input,
                  activeInputIndex === index && dynamicStyles.inputActive
                ]}
                placeholder="-"
                placeholderTextColor={nightMode ? '#888' : '#ccc'}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onFocus={() => setActiveInputIndex(index)}
                onBlur={() => setActiveInputIndex(null)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              dynamicStyles.verifyOtpButton,
              { backgroundColor: attemptsRemaining === 0 ? (nightMode ? '#444' : '#ccc') : '#1996D3' }
            ]}
            onPress={handleVerifyOtp}
            disabled={attemptsRemaining === 0}
          >
            {loading ? (
              <Text style={dynamicStyles.verifyOtpButtonText}>verifying</Text>
            ) : (
              <Text style={dynamicStyles.verifyOtpButtonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <View style={dynamicStyles.textContainer}>
            <Text style={dynamicStyles.attemptsText}>
              Attempts remaining: {attemptsRemaining}
            </Text>
          </View>

          {/* Dynamic Popup for OTP Verification */}
          <DynamicPopup
            visible={popupVisible}
            type={popupData.type}
            message={popupData.message}
            onClose={() => setPopupVisible(false)}
            onOk={() => setPopupVisible(false)}
          />

          {/* UserCard Modal for displaying fetched user accounts */}
          {showUserCard && (
            <UserCard
              visible={showUserCard}
              onClose={() => setShowUserCard(false)}
              users={userCards}
              onSelectUser={handleUserSelect}
            />
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const createStyles = (nightMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: nightMode ? '#121212' : '#f8f9fa',
  },
  topContainer: {
    height: '10%',
    borderBottomEndRadius: 70,
    width: '100%',
    backgroundColor: nightMode ? '#1996D3' : '#1996D3',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  bottomContainer: {
    height: '10%',
    width: '100%',
    borderTopLeftRadius: 70,
    backgroundColor: nightMode ? '#1565C0' : '#1996D3',
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: -1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '10%',
    paddingBottom: '10%',
    backgroundColor: nightMode ? '#121212' : '#f8f9fa',
  },
  imageUriContainer: {
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageUri: {
    width: 150,
    height: 150,
    borderRadius: 20,
    opacity: nightMode ? 0.9 : 1,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headingOTP: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: nightMode ? '#FFFFFF' : '#074B7C',
  },
  paraOTP: {
    textAlign: 'center',
    fontSize: 14,
    color: nightMode ? '#B3B3B3' : '#6c757d',
    marginTop: 8,
  },
  timerText: {
    textAlign: 'center',
    fontSize: 16,
    color: nightMode ? '#FF7043' : '#FF5722',
    marginTop: 8,
  },
  attemptsText: {
    textAlign: 'center',
    fontSize: 16,
    color: nightMode ? '#FF7043' : '#FF5722',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  input: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: nightMode ? '#444' : '#1996D3',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    backgroundColor: nightMode ? '#1E1E1E' : 'white',
    color: nightMode ? '#FFFFFF' : '#000000',
  },
  inputActive: {
    borderWidth: 2,
    borderColor: nightMode ? '#1976D2' : '#1996D3',
    shadowColor: nightMode ? '#1976D2' : '#1996D3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: nightMode ? 0.3 : 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  verifyOtpButton: {
    width: '80%',
    padding: 14,
    alignSelf: 'center',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: nightMode ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifyOtpButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default OtpPage;