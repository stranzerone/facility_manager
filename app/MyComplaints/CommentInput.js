import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Image,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const CommentInput = ({ value, onChangeText, onSubmit, isPosting }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const { nightMode } = usePermissions();
  const navigation = useNavigation();

  // Function to compress and convert the image to Base64
  const compressAndConvertToBase64 = async (uri) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Resize image
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // Compress quality
      );

      const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Error compressing or converting image:', error);
      Alert.alert('Error', 'Failed to process the image. Please try again.');
      return null;
    }
  };

  // Handle attaching an image from the library
  const handleImageAttachment = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.5,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setImagePreview(imageUri);

        const base64 = await compressAndConvertToBase64(imageUri);
        setImageBase64(base64);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  // Handle capturing an image with the camera
  const handleCaptureImage = () => {
    navigation.navigate('CameraScreen', {
      onPictureTaken: async (imageUri) => {
        setImagePreview(imageUri);
        try {
          const base64 = await compressAndConvertToBase64(imageUri);
          setImageBase64(base64);
        } catch (error) {
          Alert.alert('Error', 'Failed to process the captured image.');
        }
      },
    });
  };

  // Handle submitting the comment
  const handleSubmit = () => {
    if (!value && !imageBase64) {
      Alert.alert('Error', 'Please add a comment or attach an image.');
      return;
    }

    const dataToSubmit = {
      remarks: value,
      file: imageBase64,
    };

    onSubmit(dataToSubmit);

    // Clear input and image data
    onChangeText(''); // Clear the text input
    setImagePreview(null); // Clear the image preview
    setImageBase64(null); // Clear the base64 data
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: nightMode ? '#374151' : '#f3f4f6',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: nightMode ? '#6b7280' : '#d1d5db',
      }}
    >
      {/* Image Preview */}
      {imagePreview && (
        <TouchableOpacity
          onPress={() => setIsPreviewVisible(true)}
          style={{ marginRight: 8 }}
        >
          <Image
            source={{ uri: imagePreview }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              opacity: nightMode ? 0.9 : 1,
            }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}

      {/* Text Input */}
      <TextInput
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: nightMode ? '#6b7280' : '#d1d5db',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          color: nightMode ? '#f9fafb' : '#374151',
          backgroundColor: nightMode ? '#4b5563' : '#ffffff',
        }}
        placeholder="Add a new comment"
        placeholderTextColor={nightMode ? '#9ca3af' : '#6b7280'}
        value={value}
        onChangeText={onChangeText}
      />

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
        {/* Attach Image Icon */}
        <TouchableOpacity onPress={handleImageAttachment} style={{ marginRight: 8 }}>
          <FontAwesome 
            name="paperclip" 
            size={24} 
            color={nightMode ? '#60a5fa' : '#1996D3'} 
          />
        </TouchableOpacity>

        {/* Capture Image Icon */}
        <TouchableOpacity onPress={handleCaptureImage} style={{ marginRight: 8 }}>
          <FontAwesome 
            name="camera" 
            size={24} 
            color={nightMode ? '#60a5fa' : '#1996D3'} 
          />
        </TouchableOpacity>

        {/* Submit Button */}
        {isPosting ? (
          <ActivityIndicator 
            size="small" 
            color={nightMode ? '#60a5fa' : '#1996D3'} 
          />
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: nightMode ? '#3730a3' : '#3b82f6',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
            onPress={handleSubmit}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Post</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Image Preview Modal */}
      {isPreviewVisible && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isPreviewVisible}
          onRequestClose={() => setIsPreviewVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsPreviewVisible(false)}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: nightMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
              }}
            >
              <Image
                source={{ uri: imagePreview }}
                style={{
                  width: '80%',
                  height: '80%',
                }}
                resizeMode="contain"
              />
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

export default CommentInput;