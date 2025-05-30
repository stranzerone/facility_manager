import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const TextInputField = ({ inputValue, handleInputChange }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Text Input:</Text>
    <TextInput
      style={styles.textInput}
      placeholder="Enter text"
      value={inputValue}
      onChangeText={handleInputChange}
      placeholderTextColor="#888"
    />
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
  textInput: {
    borderWidth: 1,
    borderColor: '#1996D3',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
  },
});

export default TextInputField;
