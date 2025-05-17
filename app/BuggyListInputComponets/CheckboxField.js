import React from 'react';
import { View, StyleSheet } from 'react-native';
import Checkbox from 'expo-checkbox';

const CheckboxField = ({ inputValue, setInputValue }) => (
  <View style={styles.checkboxContainer}>
    <Checkbox
      value={inputValue === '1'}
      onValueChange={(checked) => setInputValue(checked ? '1' : '0')}
      color={inputValue === '1' ? '#074B7C' : undefined}
    />
  </View>
);

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
});

export default CheckboxField;
