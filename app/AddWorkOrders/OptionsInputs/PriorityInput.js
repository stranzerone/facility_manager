import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OptionsModal from '../../DynamivPopUps/DynamicOptionsPopUp';
import { usePermissions } from '../../GlobalVariables/PermissionsContext';

const OptionSelector = ({ onPrioritySelect }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { nightMode } = usePermissions();

  const options = [
    { label: 'Normal', value: 'Normal' },
    { label: 'High', value: 'High' },
    { label: 'Emergency', value: 'Emergency' },
  ];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    onPrioritySelect(option);
    setIsModalVisible(false);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  // Dynamic styles based on night mode
  const dynamicStyles = StyleSheet.create({
    container: {
      ...styles.container,
    backgroundColor: nightMode ? '#374151' : '#f5f5f5',
    },
    inputContainer: {
      ...styles.inputContainer,
      backgroundColor: nightMode ? '#2a2a2a' : '#ffffff',
    backgroundColor: nightMode ? '#374151' : '#f5f5f5',
    },
    selectedText: {
      ...styles.selectedText,
      color: nightMode ? '#ffffff' : '#074B7C',
    },
  });

  const iconColor = nightMode ? '#ffffff' : '#074B7C';

  return (
    <View style={dynamicStyles.container}>
      <TouchableOpacity 
        style={dynamicStyles.inputContainer} 
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={dynamicStyles.selectedText}>
          {selectedOption ? selectedOption : 'Normal'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={iconColor} />
      </TouchableOpacity>

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
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 10,
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
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
  },
});