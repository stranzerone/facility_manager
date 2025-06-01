import React, { useEffect, useState } from 'react';
import {
  View, Text, Platform, Modal, Image, TouchableOpacity, StyleSheet
} from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './utils/Store/Store.js';
import MainNavigation from './MainNavigation.js';
import NfcManager from 'react-native-nfc-manager';
import initializeOneSignal from './utils/GlobalFunctions/PushNotifications.js';
import DynamicPopup from './app/DynamivPopUps/DynapicPopUpScreen.js';
import Toast from 'react-native-toast-message'; // ✅ Required

NfcManager.start();

const App = () => {
  const [nfcEnabled, setNfcEnabled] = useState(null);
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modelType, setModelType] = useState('warning');
  useEffect(() => {
    const checkNfcStatus = async () => {
      try {
        const isSupported = await NfcManager.isSupported();
        if (!isSupported) return;

        const isEnabled = await NfcManager.isEnabled();
        setNfcEnabled(isEnabled);
        if (!isEnabled) setShowNfcModal(true);
      } catch (err) {
        console.error('Error checking NFC:', err);
      }
    };

    checkNfcStatus();
    initializeOneSignal();
  }, []);

  const handleEnableNfc = () => {
    if (Platform.OS === 'android') {
      NfcManager.goToNfcSetting();
    }
    setShowNfcModal(false);
  };

  const handleProceedWithoutNfc = () => {
    setShowNfcModal(false);
  };


  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <View style={{ flex: 1 }}>
          <MainNavigation />

          {/* Tag read result popup */}
          {modalVisible && (
            <DynamicPopup
              visible={modalVisible}
              type={modelType}
              message={modalMessage}
              onClose={() => setModalVisible(false)}
              onOk={() => setModalVisible(false)}
            />
          )}

          {/* Ask to enable NFC */}
          {showNfcModal && (
            <Modal visible transparent animationType="fade">
              <View style={styles.modalBackground}>
                <View style={styles.popupContainer}>
                  <Image
                    source={require('./assets/SvgImages/fm.jpg')}
                    style={styles.logo}
                  />
                  <Text style={styles.popupTitle}>Enable NFC</Text>
                  <Text style={styles.popupText}>
                    Please enable NFC to continue or proceed without it.
                  </Text>
                  <TouchableOpacity
                    style={styles.enableButton}
                    onPress={handleEnableNfc}
                  >
                    <Text style={styles.buttonText}>Enable NFC</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.enableButton, { backgroundColor: '#1996D3', marginTop: 10 }]}
                    onPress={handleProceedWithoutNfc}
                  >
                    <Text style={styles.buttonText}>Proceed Without NFC</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

          {/* ✅ Toast Message Handler */}
          <Toast />
        </View>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 10 },
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#1996D3',
  },
  popupTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#074B7C',
    marginBottom: 15,
  },
  popupText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
  },
  enableButton: {
    backgroundColor: '#074B7C',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
