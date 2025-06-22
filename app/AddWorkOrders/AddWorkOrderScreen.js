import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { FontAwesome, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import TypeSelector from './OptionsInputs/AddType';
import TaskInput from './TextInput/TextInputs';
import PrioritySelector from './OptionsInputs/PriorityInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
import { useNavigation } from '@react-navigation/native';
import { workOrderService } from '../../services/apis/workorderApis';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const AddWorkOrderScreen = ({screen,type,uuid}) => {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [priority, setPriority] = useState("Normal");
  const [typeSelected, setTypeSelected] = useState("Panned");
  const [breakdownHours, setBreakdownHours] = useState("");
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState('success');
  const [popupMessage, setPopupMessage] = useState('');
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonLoading,setButtonLoading]  = useState(false)
const[optionsOpen,setOpen]  = useState(false)
const [dropdownOpen, setDropdownOpen] = useState(false);
const [workOrderType, setWorkOrderType] = useState("workorder");

  const navigation = useNavigation();

const {nightMode}  = usePermissions()

  const resetForm = () => {
    setName('');
    setDueDate('');
    setEstimatedTime('');
    setSelectedAsset(null);
    setPriority("Normal");
    setTypeSelected("");
    setBreakdownHours("");
  };

  const handleSubmit = async() => {
    setButtonLoading(true)
    const workOrderData = {
      name,
      dueDate,
      priority,
      estimatedTime,
      woType:workOrderType,
      asset: selectedAsset,
      type: typeSelected,
      breakdownHours: workOrderType === "breakdown" ? breakdownHours : null,
    };
    
    try {
      if (!name || !typeSelected || !dueDate || !priority) {
        setPopupType('error');
        setPopupMessage('Please fill in all fields before submitting.');
        setPopupVisible(true);
        return;
      }
     
    const response =  await workOrderService.createWorkOrder(workOrderData);
    if(response.status == "success"){
      setPopupType('success');
      if(workOrderType==="breakdown"){
        setPopupMessage('Breakdown created  successfully!');
      }else{
      setPopupMessage('Work order submitted successfully!');
      }
      setPopupVisible(true);
      if(screen === 'qr'){
        resetForm();
        setTimeout(()=>{
        navigation.navigate('MyWorkOrders', { qrValue:uuid, screenType:type });
      },2000)
      }else{
        resetForm();
        setTimeout(()=>{
      navigation.goBack();
        },2000)
      }
     
    }

    } catch (error) {
      setPopupType('error');
      setPopupMessage('Failed to submit work order. Please try again.');
      setPopupVisible(true);
    }finally{
      
      setButtonLoading(false)
    }
  };

  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    clearSearch()
    setOpen(false)
  };

  const handleSearchAssets = async (query) => {
    setSearchQuery(query);
    setOpen(true)
    if (!query.trim()) {
      setAssets([]);
      return;
    }
    setLoading(true);
    try {
      const results = await workOrderService.getAsets(query);
      setAssets(results.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setAssets([]);
    setOpen(false)
  };

  const styles = getStyles(nightMode);

  return (
    <SafeAreaView style={styles.screenContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'height' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          scrollEnabled={!optionsOpen && !dropdownOpen}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>

            {/* Work Order Type Dropdown */}
            <View style={[styles.dropdownContainer, { zIndex: dropdownOpen ? 1000 : 1 }]}>
              <Text style={styles.dropdownLabel}>WorkOrder Type</Text>
              <TouchableOpacity
                onPress={() => setDropdownOpen(!dropdownOpen)}
                style={styles.dropdownButton}
              >
                <Text style={styles.dropdownButtonText}>{workOrderType || "Select Type"}</Text>
                <FontAwesome name={dropdownOpen ? "chevron-up" : "chevron-down"} size={16} color={nightMode ? "#9CA3AF" : "gray"} />
              </TouchableOpacity>

              {dropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {["workorder", "breakdown"].map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        setWorkOrderType(item);
                        setDropdownOpen(false);
                      }}
                      style={styles.dropdownItem}
                    >
                      <View style={styles.dropdownDot}></View>
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Search Input with Search & Clear Icons */}
            <View style={[styles.searchContainer, { zIndex: dropdownOpen ? -1 : 1 }]}>
              <Ionicons name="search" size={14} color="white" style={styles.searchIcon} />
              <TextInput
                style={styles.input}
                placeholder="Search for an asset..."
                placeholderTextColor={nightMode ? "#9CA3AF" : "#6B7280"}
                value={searchQuery}
                onChangeText={handleSearchAssets}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
                  <Ionicons name="close-circle" size={22} color={nightMode ? "#9CA3AF" : "gray"} />
                </TouchableOpacity>
              )}
            </View>

            {loading && <ActivityIndicator size="small" color="#074B7C" />}
            
            {/* Asset List with Icons */}
            {optionsOpen && (
              <View style={styles.assetListContainer}>
                <ScrollView 
                  style={styles.assetScrollView}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {assets?.map((asset, index) => (
                    <TouchableOpacity key={index} style={styles.assetCard} onPress={() => handleSelectAsset(asset)}>
                      <MaterialIcons name="inventory" size={16} color="#074B7C" />
                      <Text style={styles.assetText}>{asset.Name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {selectedAsset && (
              <View style={styles.selectedAssetContainer}>
                <MaterialIcons name="check-circle" size={22} color="#155B74" />
                <Text style={styles.selectedAssetText}>{selectedAsset.Name}</Text>
              </View>
            )}
            
            <View style={styles.rowContainer}>
              <View style={styles.inputContainer}>
                <TypeSelector onTypeSelect={setTypeSelected} />
                <View style={styles.mandatoryContainer}>
                  <Text style={styles.mandatoryText}>
                    <FontAwesome6 name="star-of-life" size={8} color="red" /> mandatory
                  </Text>
                </View>    
              </View>
              <View style={styles.inputContainer}>
                <PrioritySelector onPrioritySelect={setPriority} />
                <View style={styles.mandatoryContainer}>
                  <Text style={styles.mandatoryText}>
                    <FontAwesome6 name="star-of-life" size={8} color="red" /> mandatory
                  </Text>
                </View>    
              </View>
            </View>

            <View style={styles.formSection}>
              <TaskInput
                onChangeName={setName}
                onChangeDueDate={setDueDate}
                onChangeEstimatedTime={setEstimatedTime}
                workOrderType={workOrderType}
                onChangeBreakDonwHours={setBreakdownHours}
              />
            </View>

            <View style={styles.buttonContainer}>
              {buttonLoading ? (
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Creating...</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Create {workOrderType}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        <DynamicPopup
          visible={isPopupVisible}
          type={popupType}
          message={popupMessage}
          onClose={() => setPopupVisible(false)}
          onOk={() => setPopupVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (nightMode) => StyleSheet.create({
  // Dropdown styles
  dropdownContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  dropdownLabel: {
    color: nightMode ? '#E5E5E5' : '#374151',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    backgroundColor: nightMode ? '#374151' : 'white',
    borderWidth: 1,
    borderColor: nightMode ? '#4B5563' : '#9CA3AF',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    color: nightMode ? '#E5E5E5' : '#374151',
    fontSize: 16,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: nightMode ? '#374151' : 'white',
    borderWidth: 1,
    borderColor: nightMode ? '#4B5563' : '#D1D5DB',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: nightMode ? '#4B5563' : '#D1D5DB',
  },
  dropdownDot: {
    backgroundColor: '#3B82F6',
    height: 12,
    width: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  dropdownItemText: {
    color: nightMode ? '#E5E5E5' : 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mandatoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mandatoryText: {
    fontSize: 10,
    color: '#EF4444',
    marginLeft: 4,
  },
  // Asset List Container
  assetListContainer: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#074B7C',
    borderRadius: 12,
    backgroundColor: nightMode ? '#374151' : '#FFFFFF',
    maxHeight: 250,
  },
  assetScrollView: {
    maxHeight: 248,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "flex-start",
    height: 50,
    textAlign: 'center',
    width: "97%",
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#074B7C",
    backgroundColor: nightMode ? '#374151' : '#FFFFFF',
    paddingHorizontal: 10,
    marginVertical: 1,
  },
  searchIcon: {
    backgroundColor: "#074B7C",
    padding: 6,
    color: "white",
    borderRadius: 10,
    marginRight: 10,
  },
  assetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#074B7C",
    backgroundColor: nightMode ? '#4B5563' : '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  assetText: {
    fontSize: 17,
    fontWeight: '500',
    width: "90%",
    color: nightMode ? '#E5E5E5' : '#2C3E50',
    marginLeft: 0,
  },
  selectedAssetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: nightMode ? '#1F2937' : '#D1ECF1',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#17A2B8',
  },
  selectedAssetText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: nightMode ? '#60A5FA' : '#155B74',
    marginLeft: 10,
  },
  screenContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: nightMode ? '#1F2937' : '#F8F9FA',
    paddingHorizontal: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    flex: 1,
    width: '100%',
    marginTop: 5,
    padding: 0,
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 16,
    color: nightMode ? '#E5E5E5' : '#000000',
  },
  clearIcon: {
    marginLeft: 10,
  },
  formSection: {
    borderRadius: 12,
    padding: 10,
    paddingHorizontal: 0,
    marginBottom: 25,
    paddingTop: 20,
    backgroundColor: nightMode ? '#374151' : '#FFFFFF',
  },
  rowContainer: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  inputContainer: {
    flex: 1,
    marginRight: 12,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: nightMode ? '#1E40AF' : '#074B7C',
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