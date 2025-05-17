import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import TypeSelector from './OptionsInputs/AddType';
import TaskInput from './TextInput/TextInputs';
import PrioritySelector from './OptionsInputs/PriorityInput';
import AssetSearch from './AssetSearch/AssetSearch';
import { SafeAreaView } from 'react-native-safe-area-context';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
import { submitWorkOrder } from '../../service/AddWorkOrderApis/CreateWorkOrderApi';
import { useNavigation } from '@react-navigation/native';

const AddWorkOrderScreen = () => {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [priority, setPriority] = useState("Normal");
  const [typeSelected, setTypeSelected] = useState("Panned");
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState('success');
  const [popupMessage, setPopupMessage] = useState('');

  const navigation = useNavigation()
  const handleSubmit = async () => {
    if (!name || !selectedAsset) {
      setPopupType('error');
      setPopupMessage('Please fill in all fields before submitting.');
      setPopupVisible(true);
      return;
    }

    const workOrderData = {
      name,
      dueDate,
      priority,
      estimatedTime,
      asset: selectedAsset,
      type: typeSelected,
    };

    try {
      await submitWorkOrder(workOrderData);
      setPopupType('success');
      setPopupMessage('Work order submitted successfully!');
      setPopupVisible(true);
      navigation.navigate('WorkOrderHomeTab')
      resetForm();
    } catch (error) {
      setPopupType('error');
      setPopupMessage('Failed to submit work order. Please try again.');
      setPopupVisible(true);
    }
  };

  const resetForm = () => {
    setName('');
    setDueDate('');
    setEstimatedTime('');
    setSelectedAsset(null);
    setPriority("Normal");
    setTypeSelected("Panned");
  };

  const handlePopupClose = () => {
    setPopupVisible(false); // Hide the popup
    if (popupType === 'success') {
      // Optionally, reset form state or trigger other actions here if needed
    }
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <View style={styles.formSection}>
              <AssetSearch onSelectAsset={setSelectedAsset} />
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.inputContainer}>
                <TypeSelector onTypeSelect={setTypeSelected} />
              </View>
              <View style={styles.inputContainer}>
                <PrioritySelector onPrioritySelect={setPriority} />
              </View>
            </View>

            <View style={styles.formSection}>
              <TaskInput
                onChangeName={setName}
                onChangeDueDate={setDueDate}
                onChangeEstimatedTime={setEstimatedTime}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Create Work Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <DynamicPopup
          visible={isPopupVisible}
          type={popupType}
          message={popupMessage}
          onClose={handlePopupClose}
          onOk={handlePopupClose}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F8F9FA', // Single background color for the entire screen
    paddingHorizontal: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  formContainer: {
    marginBottom: 20,
  },
  formSection: {
    borderRadius: 12,
    padding: 10,
    paddingHorizontal: 0,
    marginBottom: 25,
    paddingTop: 20,
    backgroundColor: '#FFFFFF', // Uniform background color for form sections
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  inputContainer: {
    flex: 1,
    marginRight: 12,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  button: {
    backgroundColor: '#074B7C',
    paddingVertical: 16,
    fontSize: 22,
    paddingHorizontal: 30,
    width: '80%',
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddWorkOrderScreen;
