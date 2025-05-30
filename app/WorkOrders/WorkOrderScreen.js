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
import { useNavigation } from '@react-navigation/native';
import Loader from '../LoadingScreen/AnimatedLoader';
import { fetchAllUsers } from '../../utils/Slices/UsersSlice';
import { fetchAllTeams } from '../../utils/Slices/TeamSlice';
import { useDispatch, useSelector } from 'react-redux';
import { usePermissions } from '../GlobalVariables/PermissionsContext';
import { workOrderService } from "../../services/apis/workorderApis";

// Colors based on nightMode
const getColors = (nightMode) => ({
  background: nightMode ? '#121212' : '#f8f9fa',
  card: nightMode ? '#1e1e1e' : '#ffffff',
  text: nightMode ? 'gray' : '#074B7C',
  icon: nightMode ? '#f8f9fa' : '#074B7C',
  button: nightMode ? '#2a2a2a' : '#f8f9fa',
  filterBg: nightMode ? '#333' : '#f8f9fa',
  noDataIcon: nightMode ? '#f8f9fa' : '#074B7C',
  whiteText: '#ffffff',
});

const WorkOrderPage = ({ route }) => {
  const qrValue = route?.params?.qrValue || null;
  const type = route?.params?.ScreenType || "OW";
  const wotype = route?.params?.wotype || null;
  const screenType = route?.params?.params?.screenType || "OW";

  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('OPEN');
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputNumber, setInputNumber] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [flag, setFlag] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.data);
  const teams = useSelector((state) => state.teams.data);
  const { ppmAsstPermissions, ppmWorkorder, nightMode } = usePermissions();
  const colors = getColors(nightMode);

  useEffect(() => {
    if (!users?.length || !teams?.length) {
      dispatch(fetchAllTeams());
      dispatch(fetchAllUsers());
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response = null;
      if (qrValue) {
        switch (screenType) {
          case "OW":
            if (wotype === "AS") {
              const bd = await workOrderService.getAssetWorkOrder(qrValue, selectedFilter, true);
              const wo = await workOrderService.getAssetWorkOrder(qrValue, selectedFilter, false);
              console.log(wo,'this are bd')
              const merged = [...wo.data, ...bd.data];
              console.log(merged,'this is merged data')
              setWorkOrders(merged || []);
            } else {
              const bd = await workOrderService.getLocationWorkOrder(qrValue, selectedFilter, true);
              const wo = await workOrderService.getLocationWorkOrder(qrValue, selectedFilter, false);
              console.log(wo,'this response for wo in woscreen')
              const merged = [...wo.data, ...bd.data];
              setWorkOrders(merged || []);
            }
            break;
          case "ME":
            response = await getEscalations();
            break;
        }
        if (response) setData(response || []);
      } else {
        if (screenType === "OW") {
          response = await workOrderService.getAllWorkOrders(selectedFilter, flag);
          console.log("workorders",response)
          setWorkOrders(response.data || []);
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  console.log(workOrders,'this are workorders')

  useEffect(() => {
    if (type) fetchData();
  }, [type, selectedFilter, flag, qrValue]);

  const permissionToAdd =
    ppmWorkorder.some((p) => p.includes('C')) &&
    (ppmAsstPermissions?.some((p) => p.includes('R')) || qrValue);

  const applyFilter = (filter) => {
    setSelectedFilter(filter);
    setFilterVisible(false);
  };

  const filteredWorkOrders =
    screenType !== "UW" && inputNumber
      ? workOrders?.filter((order) =>
          order.wo['Sequence No'].includes(inputNumber)
        )
      : workOrders;

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const toggleFlag = () => setFlag((prev) => !prev);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View className="flex flex-row items-center justify-between p-3 mt-1 rounded-md shadow-md"
        style={{ backgroundColor: colors.text }}>
        {/* Left: Flag & Filter */}
        <View className="flex flex-row items-center space-x-3">
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.button, borderColor: 'gray' }]}
            onPress={toggleFlag}
          >
            <Icon name="flag" size={17} color={flag ? 'red' : colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            style={[styles.button, { backgroundColor: colors.filterBg }]}
          >
            <Icon name="filter" size={17} color={colors.icon} />
            <Text style={{ color: colors.icon, marginLeft: 5 }}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Center: Status */}
        <Text style={{ color: colors.whiteText, fontWeight: '600', fontSize: 18 }}>{selectedFilter}</Text>

        {/* Right: Add Button */}
        {ppmWorkorder.some((p) => p.includes('C')) && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddWo', {
                qr: "no",
                type: null,
                screenType,
                uuid: qrValue,
              })
            }
            disabled={!permissionToAdd}
            style={[
              styles.button,
              {
                backgroundColor: permissionToAdd ? '#fff' : '#ccc',
                flexDirection: 'row',
              },
            ]}
          >
            <Icon name="plus" size={17} color={permissionToAdd ? '#074B7C' : 'gray'} />
            <Text style={{ marginLeft: 5, color: permissionToAdd ? '#074B7C' : 'gray' }}>
              Add
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : filteredWorkOrders.length === 0 ? (
        <View style={styles.noRecordsContainer}>
          <Icon name="exclamation-circle" size={50} color={colors.noDataIcon} />
          <Text style={[styles.noRecordsText, { color: colors.noDataIcon }]}>No Work Order Found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredWorkOrders}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <WorkOrderCard workOrder={item} previousScreen="Work Orders" uuid={qrValue} />
          )}
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
    alignItems: 'center',
  },
  noRecordsText: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default WorkOrderPage;
