import React, { useState } from 'react';
import { SafeAreaView, View, TextInput, Text, TouchableOpacity, StyleSheet, Platform, Dimensions, Image } from 'react-native';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleForgotPassword = () => {
    // Handle forgot password logic (e.g., API call)
    // Optionally, navigate to another screen or show a success message
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Blue Container */}
      <View style={styles.topContainer} />

      <View style={styles.centered}>
        <View style={styles.formContainer}>
          <View style={styles.imageUriContainer}>
            <Image
              source={{ uri: "https://img.icons8.com/color/48/000000/forgot-password.png" }} // Replace with your desired icon
              style={styles.imageUri}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Forgot Password</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email or phone number"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>

        
        </View>
      </View>

      {/* Bottom Blue Container */}
      <View style={styles.bottomContainer} />
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topContainer: {
    height: '10%',
    borderBottomEndRadius: 70,
    width: '70%', // Full width
    backgroundColor: '#1996D3',
    position: 'absolute', // Fix to top
    top: 0,
    zIndex: 1, // Ensure it's above other content
  },
  bottomContainer: {
    height: '10%',
    width: '70%', // Full width
    borderTopLeftRadius: 70,
    backgroundColor: '#1996D3',
    position: 'absolute', // Fix to bottom
    bottom: 0,
    right: 0,
    zIndex: -1, // Ensure it's above other content
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4, // Shadow effect on Android
  },
  imageUriContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageUri: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#074B7C',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 14,
    marginBottom: 16,
    borderColor: '#1996D3',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  button: {
    width: '100%',
    padding: 14,
    backgroundColor: '#1996D3',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  backToLogin: {
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
  },
});

export default ForgotPasswordScreen;
