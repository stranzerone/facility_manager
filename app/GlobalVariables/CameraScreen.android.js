import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const CameraScreen = ({ navigation, route }) => {
  const cameraRef = useRef(null);
  const [cameraType, setCameraType] = useState(CameraType.Back); // CameraType.Back or CameraType.Front
  const [flashMode, setFlashMode] = useState('off');
  const [isCapturing, setIsCapturing] = useState(false);

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
    setFlashMode((prev) => {
      if (prev === 'off') return 'on';
      if (prev === 'on') return 'auto';
      return 'off';
    });
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        cameraType={cameraType}
        flashMode={flashMode}
      />

      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleFlash} style={styles.sideButton}>
          <Icon name="zap" size={24} color={flashMode !== 'off' ? '#FFD700' : '#fff'} />
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
