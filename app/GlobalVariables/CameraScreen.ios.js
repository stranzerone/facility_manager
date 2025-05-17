import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const CameraScreen = ({ navigation, route }) => {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState(true);
  const [cameraPosition, setCameraPosition] = useState(true); // 
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!permission || permission.status !== 'granted') {
      requestPermission();
    }
  }, []);

  const takePhoto = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync();
        navigation.goBack();
        if (route.params?.onPictureTaken) {
          route.params.onPictureTaken(photo.uri);
        }
      } catch (error) {
        console.error('Failed to take photo:', error);
        Alert.alert('Error', 'Failed to capture photo.');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const switchCamera = () => {
setCameraType(!cameraType)
  };

  if (!permission || permission.status === null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (permission.status === 'denied') {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Camera access denied</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={cameraType ? 'back' : 'front'}
        photo
      />

      <View style={styles.controls}>
        <TouchableOpacity onPress={switchCamera} style={styles.sideButton}>
          <Icon name="refresh-ccw" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
          <Icon name="camera" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.sideButton}>
          <Icon name="x" size={28} color="#fff" />
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
    height: 64,
    width: width,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  captureButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 50,
  },
  sideButton: {
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});
