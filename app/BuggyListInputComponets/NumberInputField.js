import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const NumberInputField = ({ inputValue, handleInputChange }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Number Input:</Text>
    <TextInput
      style={styles.textInput}
      placeholder="Enter number"
      value={inputValue}
      keyboardType="numeric"
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

export default NumberInputField;
