import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OptionsModal from '../../DynamivPopUps/DynamicOptionsPopUp';
const TypeSelector = ({ onTypeSelect}) => { 
  const [selectedType, setSelectedType] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const types = [
    {label:"Planned",value:"Planned"},
    {label:"Unplanned",value:"Unplanned"},
  ]
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    onTypeSelect(type);
    setIsModalVisible(false);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.inputContainer} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.selectedText}>{selectedType ? selectedType : 'Select Type'}</Text>
        <Ionicons name="chevron-down" size={20} color="#074B7C" />
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

export default TypeSelector;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
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
