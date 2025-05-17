import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
import { submitWorkOrder } from '../../service/AddWorkOrderApis/CreateWorkOrderApi';
import TypeSelector from './OptionsInputs/AddType';
import PrioritySelector from './OptionsInputs/PriorityInput';
import GetAssets from '../../service/AddWorkOrderApis/FetchAssests';

const AddWorkOrderScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [priority, setPriority] = useState("Normal");
  const [typeSelected, setTypeSelected] = useState("Planned");
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  
  const navigation = useNavigation();

  const handleSearchAssets = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setAssets([]);
      return;
    }
    setLoading(true);
    try {
      const results = await GetAssets(query);
      setAssets(results.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
  };

  const handleSubmit = async () => {
    if (!name || !selectedAsset) {
      setPopupType('error');
      setPopupMessage('Please fill in all required fields.');
      setPopupVisible(true);
      return;
    }
    const workOrderData = { name, dueDate, estimatedTime, asset: selectedAsset, priority, type: typeSelected };
    try {
      await submitWorkOrder(workOrderData);
      setPopupType('success');
      setPopupMessage('Work order submitted successfully!');
      setPopupVisible(true);
      resetForm();
      navigation.navigate('WorkOrderHomeTab');
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
    setTypeSelected("Planned");
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            {/* Search Input */}
            <TextInput
              style={styles.input}
              placeholder="Search for an asset..."
              value={searchQuery}
              onChangeText={handleSearchAssets}
            />
            {loading && <ActivityIndicator size="small" color="#074B7C" />}
            
            {/* Asset List */}
            <ScrollView>
              {assets?.map((asset, index) => (
                <TouchableOpacity key={index} style={styles.assetCard} onPress={() => handleSelectAsset(asset)}>
                  <Text style={styles.assetText}>{asset.Name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Selected Asset */}
            {selectedAsset && (
              <View style={styles.selectedAssetContainer}>
                <Text style={styles.selectedAssetText}>Selected: {selectedAsset.name}</Text>
              </View>
            )}
            
            {/* Additional Inputs */}
            <TypeSelector onTypeSelect={setTypeSelected} />
            <PrioritySelector onPrioritySelect={setPriority} />
            <TextInput style={styles.input} placeholder="Work Order Name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Due Date" value={dueDate} onChangeText={setDueDate} />
            <TextInput style={styles.input} placeholder="Estimated Time" value={estimatedTime} onChangeText={setEstimatedTime} />
            
            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Create Work Order</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        <DynamicPopup visible={isPopupVisible} type={popupType} message={popupMessage} onClose={() => setPopupVisible(false)} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 20 },
  scrollContainer: { paddingBottom: 40 },
  formContainer: { marginBottom: 20 },
  input: { borderBottomWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#074B7C', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  assetCard: { backgroundColor: '#FFF', padding: 12, marginVertical: 5, borderRadius: 8, elevation: 3 },
  assetText: { fontSize: 16, color: '#333' },
  selectedAssetContainer: { marginTop: 10, padding: 10, backgroundColor: '#E3F2FD', borderRadius: 8 },
  selectedAssetText: { fontSize: 16, fontWeight: 'bold', color: '#074B7C' },
});

export default AddWorkOrderScreen;
