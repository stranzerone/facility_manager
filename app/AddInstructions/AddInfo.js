import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import {AddInstructionApi}  from "../../service/BuggyListApis/AddInstructionsApi"
const AddInfo = () => {
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState('');
  const [optionsList, setOptionsList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const route = useRoute();
 

  const instructionTypes = [
    { label: 'Check Box', value: 'checkbox', icon: 'check-square' },
    { label: 'Text', value: 'text', icon: 'pencil-alt' },
    { label: 'Number', value: 'number', icon: 'hashtag' },
    { label: 'Dropdown', value: 'dropdown', icon: 'caret-down' },
    { label: 'Image Attachment', value: 'imageAttachment', icon: 'image' },
    { label: 'File Attachment', value: 'fileAttachment', icon: 'file-alt' },
  ];

  const handleAddInstruction = async () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a title.');
      return;
    }

    const instructionData = {
      title,
      type: selectedType,
      order:22,
      options: selectedType === 'dropdown' ? optionsList : [],
    };

    try {
      const response = await AddInstructionApi(instructionData);
      Alert.alert('Success', 'Instruction added successfully.');
      resetForm();
    } catch (error) {
      console.error('Error adding instruction:', error);
      Alert.alert('Error', 'Failed to add instruction. Please try again.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setSelectedType(null);
    setOptionsList([]);
    setDropdownOptions('');
    setModalVisible(false);
  };

  const toggleInstructionType = (type) => {
    if (type === 'dropdown') {
      setSelectedType('dropdown'); // Set selected type to 'dropdown'
      setDropdownOptions(''); // Clear any existing dropdown options
      setModalVisible(true); // Open modal
    } else {
      setSelectedType(selectedType === type ? null : type); // Toggle other types
    }
  };

  const handleAddOption = () => {
    if (dropdownOptions.trim()) {
      setOptionsList((prev) => [...prev, dropdownOptions.trim()]);
      setDropdownOptions('');
    } else {
      Alert.alert('Error', 'Please enter a valid option.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.label}>Title or Instruction Heading</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
        />

        <Text style={styles.label}>Select Instruction Types</Text>
        {instructionTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[styles.optionContainer, selectedType === type.value && styles.selectedOption]}
            onPress={() => toggleInstructionType(type.value)}
          >
            <FontAwesome5
              name={type.icon}
              size={20}
              color={selectedType === type.value ? "#fff" : "#074B7C"}
            />
            <Text style={[styles.optionLabel, selectedType === type.value && styles.selectedText]}>
              {type.label}
            </Text>
            {selectedType === type.value && (
              <AntDesign name="checkcircle" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        ))}

        {/* Modal for Adding Dropdown Options */}
        <Modal
          transparent={true}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Options for Dropdown</Text>
              <TextInput
                style={styles.input}
                value={dropdownOptions}
                onChangeText={setDropdownOptions}
                placeholder="Enter option"
              />
              <TouchableOpacity style={styles.addOptionButton} onPress={handleAddOption}>
                <AntDesign name="pluscircleo" size={20} color="#074B7C" />
                <Text style={styles.addOptionText}>Add Option</Text>
              </TouchableOpacity>

              {optionsList.length > 0 && (
                <View style={styles.optionsListContainer}>
                  <Text style={styles.optionsListTitle}>Added Options:</Text>
                  {optionsList.map((option, index) => (
                    <Text key={index} style={styles.optionText}>{option}</Text>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
                <AntDesign name="close" size={24} color="#ff0000" />
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Add Instruction Button at the Bottom */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddInstruction}>
        <AntDesign name="pluscircleo" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Instruction</Text>
      </TouchableOpacity>
    </View>
  );
};

// Add your existing styles here...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80, // Space for the button at the bottom
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#074B7C',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#074B7C',
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#074B7C',
  },
  optionLabel: {
    fontSize: 16,
    color: '#074B7C',
    flex: 1,
    marginLeft: 10,
  },
  selectedText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1f5fe',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  addOptionText: {
    marginLeft: 8,
    color: '#074B7C',
  },
  optionsListContainer: {
    marginTop: 10,
  },
  optionsListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#074B7C',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  closeModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  closeModalText: {
    color: '#ff0000',
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#074B7C',
    padding: 15,
    borderRadius: 5,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default AddInfo;
