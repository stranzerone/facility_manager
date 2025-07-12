import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OptionsModal from '../../DynamivPopUps/DynamicOptionsPopUp';
import { usePermissions } from '../../GlobalVariables/PermissionsContext';

const TypeSelector = ({ onTypeSelect }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { nightMode } = usePermissions();

  const types = [
    { label: "Planned", value: "Planned" },
    { label: "Unplanned", value: "Unplanned" },
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    onTypeSelect(type);
    setIsModalVisible(false);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const styles = getStyles(nightMode);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.inputContainer} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.selectedText}>{selectedType ? selectedType : 'Select Type'}</Text>
        <Ionicons name="chevron-down" size={20} color={nightMode ? "#60A5FA" : "#074B7C"} />
      </TouchableOpacity>

      {/* Use OptionsModal for displaying options */}
      <OptionsModal
        visible={isModalVisible}
        options={types}
        onSelect={handleTypeSelect}
        onClose={closeModal}
      />
    </View>
  );
};

const getStyles = (nightMode) => StyleSheet.create({
  container: {
    backgroundColor: nightMode ? '#374151' : '#f5f5f5',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: nightMode ? '#4B5563' : '#1996D3',
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: nightMode ? '#4B5563' : '#FFFFFF',
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
    color: nightMode ? '#E5E5E5' : '#074B7C',
  },
});

export default TypeSelector;