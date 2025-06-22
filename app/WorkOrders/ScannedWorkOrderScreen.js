import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  Image,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FilterOptions from './WorkOrderFilter';
import WorkOrderCard from './WorkOrderCards';
import { getLocationWorkOrder } from '../../service/WorkOrderApis/GetLocationWo';
import { GetSingleWorkOrders } from '../../service/WorkOrderApis/GetSingleWorkOrderApi';
import Loader from '../LoadingScreen/AnimatedLoader';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { clearAllUsers, fetchAllUsers } from '../../utils/Slices/UsersSlice';
import { clearAllTeams, fetchAllTeams } from '../../utils/Slices/TeamSlice';
import { usePermissions } from '../GlobalVariables/PermissionsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocationHk } from '../../service/HouseKeepingApis/GetHkOnScan';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';

const ScannedWorkOrderPage = ({ route, uuids: passedUuid }) => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('OPEN'); // Default filter
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputNumber, setInputNumber] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  console.log("hello")
  const type = route?.params?.type || null;
  const uuid = route?.params?.uuid || passedUuid || null;

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.data);
  const teams = useSelector((state) => state.teams.data);
  const { ppmAsstPermissions,ppmWorkorder } = usePermissions();
  const [siteLogo,setSiteLogo]  = useState(null)
 const [listType,setListType] = useState(false)
 const [breakdownActive,setBreakdownActive] = useState(false)
  useEffect(() => {
    if (!users || !teams || users.length === 0 || teams.length === 0) {
      dispatch(fetchAllUsers());
      dispatch(fetchAllTeams());
    }
  }, [dispatch]);




  useFocusEffect(
    React.useCallback(() => {
      fetchWorkOrders();
    }, [uuid, type, selectedFilter, listType,breakdownActive])
  );

  const fetchWorkOrders = async () => {
    setLoading(true);
  
    try {
      let response = [];
  
      if (type === 'LC') {
        const [responseTrue, responseFalse] = await Promise.all([
          getLocationWorkOrder(uuid, selectedFilter, true),
          getLocationWorkOrder(uuid, selectedFilter, false)
        ]);
  
        response = [...responseTrue, ...responseFalse];
      } else {
        const [responseTrue, responseFalse] = await Promise.all([
          GetSingleWorkOrders(uuid, selectedFilter, true),
          GetSingleWorkOrders(uuid, selectedFilter, false)
        ]);
  
        response = [...responseTrue, ...responseFalse];      }
  
      // Ensure response is an array before setting state
      setWorkOrders(response || []);
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop refreshing
    }
  };
  

const permissionToAdd = ppmWorkorder.some((permission) => permission.includes('C'))

  const applyFilter = (filter) => {
    setSelectedFilter(filter); // Apply selected filter
    setFilterVisible(false);
  };

  const filteredWorkOrders = workOrders.filter((order) => {
    // Filter work orders based on search input and selectedFilter
    const matchesFilter = order?.wo?.Status === selectedFilter;
    const matchesSearch = !inputNumber || order.wo['Sequence No'].includes(inputNumber);
    return matchesFilter && matchesSearch;
  });

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkOrders();
  };

  useEffect(() => {
    const currentRoute = navigation.getState().routes[navigation.getState().index].name;
  }, [navigation]);
  

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userInfo');
    const teams =   await dispatch(clearAllTeams())
      await dispatch(clearAllUsers())
      navigation.replace("Login");

    } catch (error) {
      console.error('Error clearing local storage', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };

  useEffect(() => {
    // Define the fetchLogo function inside useEffect
    const fetchLogo = async () => {
      try {
        const societyString = await AsyncStorage.getItem('userInfo');
       
        if (societyString) {
          const societyData = JSON.parse(societyString); // Parse the data
          const parsedImages = JSON.parse(societyData.data.society.data)
          setSiteLogo(parsedImages.logo); // Set the logo URL
        } else {
          console.log('No society data found.');
        }
      } catch (error) {
        console.error('Error fetching society data:', error);
      }
    };

    fetchLogo(); // Call the function to fetch logo
  }, []); // Empty dependency array ensures this runs once when the component mounts


  const hkClicked = () => {
    setListType((prevListType) => !prevListType);
    setBreakdownActive(false);
  };
  
  const breakdownClicked = () => {
    setListType(false);
    setBreakdownActive((prevBreakdownActive) => !prevBreakdownActive);

  };
  


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1996D3' }}>
    <View style={styles.container}className="text-center">
      <View style={styles.topHeader}   >
     
     <View className='flex justify-between items-center'>
       {siteLogo &&
<Image   className="h-32 w-24"
  source={{ uri: siteLogo }}
  style={[styles.logo, { borderRadius: 48, overflow: 'hidden' }]} 
  resizeMode="contain" />}
</View>
<View className="w-1/3"> 
  <Text className="text-lg text-start text-white font-bold pl-2">{listType?"HouseKeeping Wo":breakdownActive?"Breakdowns" :"Work Orders"}</Text>

  </View>
<View>

     <TouchableOpacity 
           
            onPress={() => setModalVisible(true)} // Open confirmation popup
            className="bg-red-600 p-2 rounded-full"
          >
            <Icon name="power-off" size={15} color="white" />
      </TouchableOpacity>
      </View>
</View>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>

          <TouchableOpacity
            onPress={() => setFilterVisible((prev) => !prev)}
            style={styles.statusButton}
          >
            <Icon name="filter" size={20} color="#074B7C" style={styles.searchIcon} />
            <Text style={styles.statusButtonText}>Filter</Text>
          </TouchableOpacity>

          <View style={styles.statusTextContainer}>
            <Text style={styles.statusText}>{selectedFilter}</Text>
          </View>
            <TouchableOpacity
            onPress={() => navigation.navigate('AddWo', { qr:"qr",type:type,uuid:uuid })}
            style={[styles.addButton,{backgroundColor:permissionToAdd ? 'white' : 'lightgray'}]}
            disabled={!permissionToAdd}
            >
              <Icon name="plus" size={20} color="#074B7C" style={styles.searchIcon} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
        </View>
      </View>



 <View className="flex flex-row justify-start p-2 w-full gap-3 items-center">
  {/* Back Button */}
  <TouchableOpacity
    className="flex flex-row bg-blue-500 justify-center p-1 rounded-md w-[14vw] items-center px-3"
    onPress={() =>{ navigation.reset({
      index: 0,
      routes: [{ name: "Home" }], // Ensure this is the correct screen name
    });
    }}
  >
    <Icon name="arrow-left" size={20} color="white" />
  </TouchableOpacity>

  {/* Search Input */}
  {/* <View className="flex flex-row border border-gray-500 rounded-md w-[50vw] gap-1 items-center px-1">
    <Icon name="search" size={18} color="#074B7C" className="mr-2" />
    <TextInput
      style={styles.numberInput}
      onChangeText={(text) => setInputNumber(text)}
      value={inputNumber}
      placeholder="Search WO ID"
      keyboardType="numeric"
      placeholderTextColor="#888"
      className="flex-1"
    />
  </View> */}


 {/* <TouchableOpacity
    className={`${listType?"bg-green-500":"bg-white text-green-400 border border-green-400"}  p-2 rounded-md w-[15vw] flex flex-row justify-center items-center`}
    onPress={() => hkClicked()}
    disabled={type === "AS"}
  >
    <Text className={`${listType?"text-white":"text-green-600"} font-extrabold text-md`}>HK</Text>
  </TouchableOpacity> */}


{/* 
  <TouchableOpacity
  
    className={`${breakdownActive?"bg-red-500":"bg-white text-red-400 border border-red-400"} p-1 rounded-md w-[35vw] flex flex-row justify-center items-center`}
    onPress={() => breakdownClicked()}
  >

<Text className={` ${breakdownActive?"text-white":"text-red-400"} font-extrabold text-md`}>Breakdowns</Text>

  </TouchableOpacity> */}


</View>






      {/* Content */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : filteredWorkOrders.length === 0 ? (
        <View style={styles.noRecordsContainer}>
          <Icon name="exclamation-circle" size={50} color="#074B7C" />
          <Text style={styles.noRecordsText}>{`No ${listType? "HouseKeeping WO":breakdownActive?"Active Breakdowns":"Work Order"} Found`}</Text>
        </View>
      ) : (
        <View className='px-4'> 
        <FlatList
          data={filteredWorkOrders}
          keyExtractor={(item) => item.wo['Sequence No']}
          renderItem={({ item }) => (
            <WorkOrderCard workOrder={item} uuid={uuid} type={type} previousScreen="ScannedWoTag" />
          )}
          contentContainerStyle={styles.contentContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />

        </View>
      )}

      {/* Filter Modal */}
      {filterVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={filterVisible}
          onRequestClose={() => setFilterVisible(false)}
        >
          <FilterOptions
            filters={['OPEN', 'STARTED', 'COMPLETED', 'HOLD', 'CANCELLED', 'REOPEN']}
            selectedFilter={selectedFilter}
            applyFilter={applyFilter}
            closeFilter={() => setFilterVisible(false)}
          />
        </Modal>
      )}
          <DynamicPopup
        visible={modalVisible}
        type="warning"
        message="You will be logged out. Are you sure you want to log out?"
        onClose={() => setModalVisible(false)}
        onOk={() => {
          setModalVisible(false);
          handleLogout();
        }}
      />
    </View>
</SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    paddingBottom:50,
  
    backgroundColor: '#f8f9fa',
  },
  topHeader: {
    width:"100%",
    backgroundColor: '#1996D3',
    padding: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent:"space-between",
    alignItems: 'center',
  
  },
  headerContainer: {
    backgroundColor: '#074B7C',
    paddingVertical: 10,
    padding:10
  },
  backButton: {
    width: 90,
    textAlign: 'center',
  
    borderRadius: 5,
  },
    logo: {
      maxWidth: 80,
      maxHeight: 45,
      borderRadius: 5,

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 5,
  },
  statusButtonText: {
    marginLeft: 5,
    color: '#074B7C',
    fontWeight:900,
  },
  statusTextContainer: {
    paddingHorizontal: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 5,
  },
  addButtonText: {
    marginLeft: 5,
    fontWeight:900,
    color: '#074B7C',
  },
  inputContainer: {
    flexDirection: 'row',
    gap:10,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    width:"90%",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  numberInput: {
    flex: 1,
    height: 30,
    color: '#333',
  },

  noRecordsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecordsText: {
    color: '#333',
    fontSize: 18,
    marginTop: 10,
  },
  contentContainer: {
    paddingBottom: 100,
  },
});

export default ScannedWorkOrderPage;
