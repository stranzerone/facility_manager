import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const OptionsModal = ({ visible, options, onSelect, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose} // Handle the back button on Android
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Select an Option</Text>
          <FlatList
            data={options}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  onSelect(item.value); // Call onSelect when an option is pressed
                  onClose(); // Close the modal immediately after selecting
                }}
              >
                <FontAwesome
                  name={item.icon || 'circle'}
                  size={20}
                  color="#074B7C"
                  style={styles.optionIcon}
                />
                <Text style={styles.modalText}>{item.label}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.value}
          />
          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Transparent black overlay
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#074B7C',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionIcon: {
    marginRight: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#333333',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#074B7C',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default OptionsModal;
