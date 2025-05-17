import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import NfcManager from 'react-native-nfc-manager';

const NfcModal = ({ showModal, onEnableNfc, onProceedWithoutNfc }) => {
  const handleEnableNfc = () => {
    if (Platform.OS === 'android') {
      NfcManager.goToNfcSetting();
      onEnableNfc(); // Close the modal after opening NFC settings
    } else {
      alert('Please enable NFC from your iPhone settings.');
      onEnableNfc(); // Close the modal after showing the alert
    }
  };

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 320, backgroundColor: '#fff', borderRadius: 15, alignItems: 'center', paddingVertical: 25, paddingHorizontal: 30, elevation: 10 }}>
          <Image
            source={require('./assets/SvgImages/fm.jpg')} // Replace with the path to your NFC icon/logo
            style={{ width: 100, height: 100, marginBottom: 20, borderWidth: 2, borderColor: '#1996D3' }}
          />
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#074B7C', marginBottom: 15 }}>Enable NFC</Text>
          <Text style={{ fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 25 }}>
            Please enable NFC to continue or proceed without it.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#074B7C', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10, width: '100%', alignItems: 'center' }}
            onPress={handleEnableNfc}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Enable NFC</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#1996D3', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 10 }}
            onPress={onProceedWithoutNfc}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Proceed Without NFC</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default NfcModal;
