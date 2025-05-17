import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

const DropdownField = ({ inputValue, setInputValue, options }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Dropdown:</Text>
    <RNPickerSelect
      onValueChange={(value) => setInputValue(value)}
      items={options.map((option) => ({ label: option, value: option }))}
      placeholder={{ label: 'Select an option', value: null }}
      value={inputValue}
      useNativeAndroidPickerStyle={false}
      style={pickerSelectStyles}
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
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#1996D3',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    color: 'black',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#1996D3',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    color: 'black',
    paddingRight: 30,
  },
};

export default DropdownField;
