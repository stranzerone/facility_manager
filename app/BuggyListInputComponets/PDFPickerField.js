import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const PDFPickerField = ({ handleDocumentPicker, selectedFile }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Upload PDF:</Text>
    <TouchableOpacity onPress={handleDocumentPicker} style={styles.button}>
      <Text style={styles.buttonText}>Choose PDF</Text>
    </TouchableOpacity>
    {selectedFile && selectedFile.uri.endsWith('.pdf') && (
      <Text style={styles.selectedFileText}>PDF Selected: {selectedFile.name}</Text>
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
  button: {
    backgroundColor: '#1996D3',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  selectedFileText: {
    marginTop: 8,
    color: '#074B7C',
    fontWeight: '600',
  },
});

export default PDFPickerField;
