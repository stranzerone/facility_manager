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
import { FontAwesome, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons'; // Added MaterialIcons
import TypeSelector from './OptionsInputs/AddType';
import TaskInput from './TextInput/TextInputs';
import PrioritySelector from './OptionsInputs/PriorityInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
import { submitWorkOrder } from '../../service/AddWorkOrderApis/CreateWorkOrderApi';
import { useNavigation } from '@react-navigation/native';
import GetAssets from '../../service/AddWorkOrderApis/FetchAssests';
import NetInfo from '@react-native-community/netinfo';
import { addToQueue } from '../../offline/fileSystem/fileOperations';
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
    const state = await NetInfo.fetch();

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
     
      if (!state.isConnected) {
        await addToQueue(workOrderData,'workorder')
      }
    const response =  await submitWorkOrder(workOrderData);
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
      const results = await GetAssets(query);
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

  return (
    <SafeAreaView  style={styles.screenContainer} >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'height' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView  contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>


          <View className="flex flex-row justify-between items-center mb-4">
  {/* Work Order Type Dropdown */}
  <View className="flex-1 relative">
    <Text className="text-gray-700 text-md font-bold mt-2">WorkOrder Type</Text>
    <TouchableOpacity
      onPress={() => setDropdownOpen(!dropdownOpen)}
      className="flex-row bg-white border border-gray-400 justify-between rounded-md w-[85vw] items-center px-4 py-2"
    >
      <Text className="text-gray-700">{workOrderType || "Select Type"}</Text>
      <FontAwesome name={dropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="gray" />
    </TouchableOpacity>

    {dropdownOpen && (
      <View className="bg-white border border-gray-300 rounded-md shadow-md absolute left-0 mt-16 right-0 z-50">
        {["workorder", "breakdown"].map((item) => (
      <TouchableOpacity
      key={item}
      onPress={() => {
        setWorkOrderType(item);
        setDropdownOpen(false);
      }}
      className="flex-row border-b border-gray-300 items-center last:border-b-0 px-4 py-2"
    >
      {/* Blue Dot */}
      <View className="bg-blue-500 h-3 rounded-full w-3 mr-2"></View>
    
      {/* Text */}
      <Text className="text-black font-bold">{item}</Text>
    </TouchableOpacity>
    
        ))}
      </View>
    )}
  </View>

  {/* Breakdown Hours Input (Only if Breakdown is selected) */}

</View>

            {/* Search Input with Search & Clear Icons */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={14} color="gray" style={styles.searchIcon} />
              <TextInput
                style={styles.input}
                placeholder="Search for an asset..."
                value={searchQuery }
                onChangeText={handleSearchAssets}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
                  <Ionicons name="close-circle" size={22} color="gray" />
                </TouchableOpacity>
              )}
            </View>

            {loading && <ActivityIndicator size="small" color="#074B7C" />}

            {/* Asset List with Icons */}
        { optionsOpen &&   <ScrollView>
              {assets?.map((asset, index) => (
                <TouchableOpacity key={index} style={styles.assetCard} onPress={() => handleSelectAsset(asset)}>
                  <MaterialIcons name="inventory" size={16} color="#074B7C" />
                  <Text style={styles.assetText}>{asset.Name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>}

            {/* Selected Asset with Check Icon */}
            {selectedAsset && (
              <View style={styles.selectedAssetContainer}>
                <MaterialIcons name="check-circle" size={22} color="#155B74" />
                <Text style={styles.selectedAssetText}>{selectedAsset.Name}</Text>
              </View>
            )}

            <View style={styles.rowContainer}>
              <View style={styles.inputContainer}>
                <TypeSelector onTypeSelect={setTypeSelected} />
 <View className ='flex-row items-center '>
      
      <Text className='text-[10px] text-red-500 ml-1'><FontAwesome6 name="star-of-life" size={8} color="red" /> mandatory</Text>
    </View>    
              </View>
              <View  style={styles.inputContainer}>
                <PrioritySelector onPrioritySelect={setPriority} />
         <View className ='flex-row items-center'>
      
          <Text className='text-[10px] text-red-500 ml-1'><FontAwesome6 name="star-of-life" size={8} color="red" /> mandatory</Text>
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
            { buttonLoading ?    
            <View style={styles.button}>
      <Text style={styles.buttonText}>Creating...</Text>

           </View>
            : <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Create {workOrderType}</Text>
              </TouchableOpacity>}
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

const styles = StyleSheet.create({
  // Existing styles remain unchanged...
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "flex-start",
    height: 50,
    textAlign:'center',
    width:"97%",
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#074B7C",
    paddingHorizontal: 10,
    marginVertical: 1,
  },
  searchIcon: {
    backgroundColor:"#074B7C",
    padding:6,
    color:"white",
    borderRadius:10,
    marginRight: 10,
  },
  assetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:4,
    justifyContent:"flex-start",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#074B7C",
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  assetText: {
    fontSize: 12,
    fontWeight: '500',
    width:"90%",
    color: '#2C3E50',
    marginLeft: 0, // Space between icon and text
  },
  selectedAssetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#D1ECF1',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#17A2B8',
  },
  selectedAssetText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#155B74',
    marginLeft: 10, 
  },

  screenContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F8F9FA',
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
    marginTop:5,
    padding:0,
    paddingVertical: 4,
    paddingHorizontal:10,
    fontSize: 16,
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
    backgroundColor: '#FFFFFF',
  },
  rowContainer: {
    flexDirection: 'row',
    marginTop:15,
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


  assetText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#2C3E50', // Darker grey for readability
  },
  
  selectedAssetContainer: {
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#D1ECF1', // Light cyan for better visibility
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#17A2B8', // Matching border with the theme
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  selectedAssetText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#155B74', // Deep blue for contrast
    flex: 1,
  },
  });

export default AddWorkOrderScreen;
