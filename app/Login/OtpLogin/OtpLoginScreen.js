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

const PhoneNumberPage = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false); // Track loading state
  const [popupVisible, setPopupVisible] = useState(false); // State for controlling popup visibility
  const [popupMessage, setPopupMessage] = useState(''); // State for storing popup message

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} // Adjusts for iOS; use 'height' for Android
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container}>
          {/* Top Blue Container */}
          <View style={styles.topContainer} />

          <View style={styles.imageUriContainer}>
            <Image source={otpSvg} style={styles.imageUri} resizeMode="contain" />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.headingOTP}>OTP VERIFICATION</Text>
            <Text style={styles.paraOTP}>
              Enter OTP for Verification for direct Login to the Dashboard
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Phone Number Or Email"
              minLength={1}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TouchableOpacity
              style={[styles.sendOtpButton, loading && styles.sendOtpButtonDisabled]}
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
          {/* <View style={styles.bottomContainer} /> */}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topContainer: {
    height: '10%',
    borderBottomEndRadius: 70,
    width: '70%',
    backgroundColor: '#1996D3',
  },
  bottomContainer: {
    height: '10%',
    width: '70%',
    borderTopLeftRadius: 70,
    backgroundColor: '#1996D3',
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
    color: '#074B7C',
  },
  paraOTP: {
    textAlign: 'start',
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    padding: 12,
    borderBottomColor: '#1996D3',
    borderBottomWidth: 1,
    backgroundColor: 'white',
    marginBottom: 16,
    color: '#074B7C',
  },
  sendOtpButton: {
    width: '80%',
    padding: 14,
    backgroundColor: '#1996D3',
    borderRadius: 12,
    alignItems: 'center',
  },
  sendOtpButtonDisabled: {
    backgroundColor: '#b0c4de',
  },
  sendOtpButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PhoneNumberPage;
