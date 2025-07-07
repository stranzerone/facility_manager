import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import Icon from 'react-native-vector-icons/Feather';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';

const { width } = Dimensions.get('window');

const CameraScreen = ({ navigation, route }) => {
  const cameraRef = useRef(null);
  const [cameraType, setCameraType] = useState(CameraType.Back); // Back or Front
const [flashEnabled, setFlashEnabled] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const permissionType =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA;

      const result = await check(permissionType);

      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
      } else {
        const requestResult = await request(permissionType);
        if (requestResult === RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera permission in settings to use this feature.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => openSettings() },
            ]
          );
        }
      }
    };

    checkPermission();
  }, []);

  const takePhoto = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        const image = await cameraRef.current.capture();
        if (route.params?.onPictureTaken) {
          route.params.onPictureTaken(image.uri);
        }
        navigation.goBack();
      } catch (error) {
        console.error('Capture failed:', error);
        Alert.alert('Error', 'Failed to capture photo.');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const switchCamera = () => {
    setCameraType((prev) =>
      prev === CameraType.Back ? CameraType.Front : CameraType.Back
    );
  };

const toggleFlash = () => {
  setFlashEnabled((prev) => !prev);
};


  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
          Waiting for camera permission...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        cameraType={cameraType}
      />

      <View style={styles.controls}>
        <TouchableOpacity  style={styles.sideButton}>
          {/* <Icon name="zap" size={24} color={!flashEnabled  ? '#FFD700' : '#fff'} /> */}
        </TouchableOpacity>

        <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
          <Icon name="camera" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={switchCamera} style={styles.sideButton}>
          <Icon name="refresh-ccw" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#1e1e1e',
    height: 80,
    width: width,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  captureButton: {
    padding: 20,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 50,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideButton: {
    padding: 10,
  },
});
