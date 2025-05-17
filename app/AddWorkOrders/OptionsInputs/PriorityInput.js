import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OptionsModal from '../../DynamivPopUps/DynamicOptionsPopUp';
const OptionSelector = ({ onPrioritySelect }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const options = [
    { label: 'Normal', value: 'Normal' },
    { label: 'High', value: 'High' },
    { label: 'Emergency', value: 'Emergency' },
  ];

  const handleOptionSelect = (option) => {
    setSelectedOption(option); // Update local state
    onPrioritySelect(option); // Call the prop function to send the selected option to the parent
    setIsModalVisible(false); // Close the modal after selection
  };

  const closeModal = () => {
    setIsModalVisible(false); // Close the modal without selection
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.inputContainer} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.selectedText}>
          {selectedOption ? selectedOption : 'Normal'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#074B7C" />
      </TouchableOpacity>

      {/* Use the OptionsModal here */}
      <OptionsModal
        visible={isModalVisible}
        options={options}
        onSelect={handleOptionSelect}
        onClose={closeModal}
      />
    </View>
  );
};

export default OptionSelector;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#074B7C',
    marginRight: 10,
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1996D3',
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
    color: '#074B7C',
  },
});
