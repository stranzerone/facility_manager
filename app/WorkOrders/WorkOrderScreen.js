import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FilterOptions from './WorkOrderFilter';
import WorkOrderCard from './WorkOrderCards';
import { fetchServiceRequests } from '../../service/FetchWorkOrderApi';
import {useNavigation } from '@react-navigation/native';
import Loader from '../LoadingScreen/AnimatedLoader';
import { fetchAllUsers } from '../../utils/Slices/UsersSlice';
import { fetchAllTeams } from '../../utils/Slices/TeamSlice';
import { useDispatch, useSelector } from 'react-redux'; // Import useSelector to access Redux state
import { usePermissions } from '../GlobalVariables/PermissionsContext';
import { GetSingleWorkOrders } from '../../service/WorkOrderApis/GetSingleWorkOrderApi';
import { getLocationWorkOrder } from '../../service/WorkOrderApis/GetLocationWo';

const WorkOrderPage = ({route}) => {

  const qrValue = route?.params?.qrValue || null
  const type = route?.params?.ScreenType || "OW"
  const wotype = route?.params?.wotype || null
  const screenType = route?.params?.params ?.screenType || "OW"
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('OPEN');
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputNumber, setInputNumber] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [flag, setFlag] = useState(false); // New state to manage flag
  const navigation = useNavigation();

  const dispatch = useDispatch(); // Use dispatch to dispatch actions
  const users = useSelector((state) => state.users.data);
  const teams = useSelector((state) => state.teams.data);
  const { ppmAsstPermissions,ppmWorkorder } = usePermissions();

  useEffect(() => {
    if (!users || !teams || users.length === 0 || teams.length === 0) {
      dispatch(fetchAllTeams());

      dispatch(fetchAllUsers());
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response = null;
      if(qrValue){
      switch (screenType) {
        case "OW":
          if(wotype === "AS"){
          response = await GetSingleWorkOrders(qrValue,selectedFilter, false);
          setWorkOrders(response || []);
          }else{
        const    responseBD = await getLocationWorkOrder(qrValue,selectedFilter, true);
        const     responseWo = await getLocationWorkOrder(qrValue,selectedFilter, false);
        const response = [...responseWo,...responseBD]
            setWorkOrders(response || []);

          }
          break;
 
        case "ME":
          response = await getEscalations();
          break;
        default:
          console.warn("Invalid type");
          break;
      }
  
      if (response) {
        setData(response || []);
      }


    }else{

switch (screenType) {
      case "OW":
        response = await fetchServiceRequests(selectedFilter);
        console.log(response,'this is the response')
        setWorkOrders(response || []);

        break;

     

    }
    }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {

    if (type) {
      fetchData();
    }
  }, [type, selectedFilter, flag,qrValue]);
  





  const permissionToAdd = ppmWorkorder.some((permission) => permission.includes('C'))


  const applyFilter = (filter) => {
    setSelectedFilter(filter);
    setFilterVisible(false);
  };

  const filteredWorkOrders = screenType !== "UW" && inputNumber
  ? workOrders?.filter(
      (order) =>
        order.wo['Sequence No'].includes(inputNumber)
    )
  : workOrders;


  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const toggleFlag = () => {
    setFlag((prevFlag) => !prevFlag); // Toggle the flag between true and false
  };

  return (
    <View style={styles.container}>

      {/* Search Input */}
      <View className="flex flex-row items-center justify-between p-3 mt-1 bg-[#074B7C] rounded-md shadow-md">
  {/* Left Side: Flag & Filter */}
  <View className="flex flex-row items-center space-x-3">
    {/* Flag Button */}
    <TouchableOpacity
      className="py-1 px-2 rounded-md border border-gray-400 bg-[#f8f9fa] shadow-md flex items-center justify-center"
      onPress={toggleFlag}
    >
      <Icon name="flag" size={17} color={flag ? 'red' : '#074B7C'} />
    </TouchableOpacity>

    {/* Filter Button */}
    <TouchableOpacity
      onPress={() => setFilterVisible((prev) => !prev)}
      className="flex flex-row  items-center px-2 py-1 bg-[#f8f9fa] rounded-md shadow-md"
    >
      <Icon name="filter" size={17} color="#074B7C" className="mr-2" />
      <Text className="text-[#074B7C] font-semibold">Filter</Text>
    </TouchableOpacity>
  </View>

  {/* Center: Current Status */}
  <Text className="text-white font-semibold text-lg">{selectedFilter}</Text>

  {/* Right Side: Add Button */}
  {ppmWorkorder.some((permission) => permission.includes('C')) && (
    <TouchableOpacity
      onPress={() => navigation.navigate('AddWo', { qr: "no", type: null, screenType:screenType , uuid: qrValue })}
      className={`flex flex-row items-center px-4 py-1 rounded-md shadow-md ${
        permissionToAdd ? 'bg-white' : 'bg-gray-300'
      }`}
      disabled={!permissionToAdd}
    >
      <Icon name="plus" size={17} color={permissionToAdd ? '#074B7C' : 'gray'} className="mr-2" />
      <Text className={`font-semibold ${permissionToAdd ? 'text-[#074B7C]' : 'text-gray-500'}`}>
        Add
      </Text>
    </TouchableOpacity>
  )}
</View>

      {/* Content */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : workOrders.length === 0 || filteredWorkOrders.length === 0 ? (
        <View style={styles.noRecordsContainer}>
          <Icon name="exclamation-circle" size={50} color="#074B7C" />
          <Text style={styles.noRecordsText}>No Work Order Found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredWorkOrders}
          keyExtractor={(item,index) => index.toString()}
          renderItem={({ item }) => <WorkOrderCard workOrder={item} previousScreen="Work Orders" uuid={qrValue} />}
          contentContainerStyle={styles.contentContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 70,
  },
  headerContainer: {
    backgroundColor: '#074B7C',
    paddingVertical: 10,
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
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    paddingVertical: 5,
    width: 100,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusButtonText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#000',
  },
  statusTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  statusText: {
    fontWeight: '900',
    fontSize: 16,
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  addButtonText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchIcon: {
    color: '#074B7C',
  },
  numberInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    width: '75%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:"flex-end",
    gap: 10,
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  flagButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecordsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 0,
    alignItems: 'center',
  },
  noRecordsText: {
    fontSize: 18,
    color: '#074B7C',
    marginTop: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
});

export default WorkOrderPage;
