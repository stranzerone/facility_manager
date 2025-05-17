import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import WorkOrderScreen from '../WorkOrders/WorkOrderScreen'; // adjust if needed
import { useNavigation } from '@react-navigation/native';

const AccessDeniedOverlay = () => {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      {/* Background Work Order screen */}
      <WorkOrderScreen />

      {/* Overlay with semi-transparent background */}
      <SafeAreaView style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.message}>
            You need to scan a QR code or touch an NFC Tag to proceed.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('QRCode')}
          >
            <MaterialIcons name="qr-code" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Scan QR</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Balanced dark transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  
  
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#074B7C',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '900',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#074B7C',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default AccessDeniedOverlay;
