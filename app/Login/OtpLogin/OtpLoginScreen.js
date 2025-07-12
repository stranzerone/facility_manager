import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { otpLoginApi } from '../../../service/LoginWithOtp/LoginWithOtpApi';
import otpSvg from '../../../assets/SvgImages/otp.png'; // Ensure the path to your image is correct
import DynamicPopup from '../../DynamivPopUps/DynapicPopUpScreen'; // Import DynamicPopup
import { usePermissions } from '../../GlobalVariables/PermissionsContext';

const PhoneNumberPage = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false); // Track loading state
  const [popupVisible, setPopupVisible] = useState(false); // State for controlling popup visibility
  const [popupMessage, setPopupMessage] = useState(''); // State for storing popup message
  const { nightMode } = usePermissions();

  const handleSendOtp = async () => {
    if (phoneNumber.length < 1) {
      setPopupMessage('Please enter a valid phone number.');
      setPopupVisible(true);
      return;
    }

    // Dismiss the keyboard before processing OTP request
    Keyboard.dismiss();

    setLoading(true);
    try {
      const response = await otpLoginApi(phoneNumber);
      
      // Delay navigation to allow keyboard to dismiss
      setTimeout(() => {
        if (response.status === 'success') {
          // OTP successfully sent, navigate to OTP entry page
          navigation.navigate('OtpEnter', { response });
        } else {
          setPopupMessage(response.message);
          setPopupVisible(true);
        }
      }, 200); // Delay to ensure keyboard has time to dismiss
    } catch (error) {
      console.error('OTP API Error:', error);
      setPopupMessage('Something went wrong. Please try again.');
      setPopupVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic styles based on night mode
  const dynamicStyles = StyleSheet.create({
    container: {
      ...styles.container,
      backgroundColor: nightMode ? '#121212' : '#f8f9fa',
    },
    topContainer: {
      ...styles.topContainer,
      backgroundColor: nightMode ? '#1996D3' : '#1996D3',
    },
    bottomContainer: {
      ...styles.bottomContainer,
      backgroundColor: nightMode ? '#1565C0' : '#1996D3',
    },
    headingOTP: {
      ...styles.headingOTP,
      color: nightMode ? '#ffffff' : '#074B7C',
    },
    paraOTP: {
      ...styles.paraOTP,
      color: nightMode ? '#b0b0b0' : '#6c757d',
    },
    input: {
      ...styles.input,
      backgroundColor: nightMode ? '#2a2a2a' : 'white',
      color: nightMode ? '#ffffff' : '#074B7C',
      borderBottomColor: nightMode ? '#1565C0' : '#1996D3',
    },
    sendOtpButton: {
      ...styles.sendOtpButton,
      backgroundColor: nightMode ? '#1565C0' : '#1996D3',
    },
    sendOtpButtonDisabled: {
      ...styles.sendOtpButtonDisabled,
      backgroundColor: nightMode ? '#424242' : '#b0c4de',
    },
  });

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} // Adjusts for iOS; use 'height' for Android
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={dynamicStyles.container}>
          {/* Top Blue Container */}
          <View style={dynamicStyles.topContainer} />

          <View style={styles.imageUriContainer}>
            <Image source={otpSvg} style={styles.imageUri} resizeMode="contain" />
          </View>

          <View style={styles.textContainer}>
            <Text style={dynamicStyles.headingOTP}>OTP VERIFICATION</Text>
            <Text style={dynamicStyles.paraOTP}>
              Enter OTP for Verification for direct Login to the Dashboard
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Enter Phone Number Or Email"
              placeholderTextColor={nightMode ? '#888888' : '#999999'}
              minLength={1}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TouchableOpacity
              style={[
                dynamicStyles.sendOtpButton, 
                loading && dynamicStyles.sendOtpButtonDisabled
              ]}
              onPress={handleSendOtp}
              disabled={loading} // Disable the button while loading
            >
              <Text style={styles.sendOtpButtonText}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dynamic Popup for displaying messages */}
          <DynamicPopup
            visible={popupVisible}
            message={popupMessage}
            onClose={() => setPopupVisible(false)}
            type="warning"
            onOk={() => setPopupVisible(false)}
          />

          {/* Bottom Blue Container */}
          {/* <View style={dynamicStyles.bottomContainer} /> */}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContainer: {
    height: '10%',
    borderBottomEndRadius: 70,
    width: '70%',
  },
  bottomContainer: {
    height: '10%',
    width: '70%',
    borderTopLeftRadius: 70,
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  imageUriContainer: {
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageUri: {
    width: 200,
    height: 200,
    borderRadius: 20,
  },
  textContainer: {
    alignItems: 'start',
    marginBottom: 40,
    paddingLeft: 20,
  },
  headingOTP: {
    fontSize: 24,
    textAlign: 'start',
    fontWeight: 'bold',
  },
  paraOTP: {
    textAlign: 'start',
    fontSize: 14,
    marginTop: 8,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    padding: 12,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  sendOtpButton: {
    width: '80%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendOtpButtonDisabled: {
    // Base disabled style
  },
  sendOtpButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PhoneNumberPage;