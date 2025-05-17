import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import icons

const ImagePickerField = ({ handleImagePicker, handleDocumentPicker, selectedFile }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Upload Image:</Text>
    <View style={styles.buttonContainer}>
      <TouchableOpacity onPress={handleImagePicker} style={styles.cameraButton}>
        <Ionicons name="camera" size={24} color="white" />
        <Text style={styles.buttonText}>Camera</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleDocumentPicker} style={styles.button}>
        <Text style={styles.buttonText}>Choose Image</Text>
      </TouchableOpacity>
    </View>
    {selectedFile && (
      <Image source={{ uri: selectedFile.uri }} style={styles.image} />
    )}
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#074B7C',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#1996D3',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#074B7C',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 8,
    borderRadius: 8,
  },
});

export default ImagePickerField;
