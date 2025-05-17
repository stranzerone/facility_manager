import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import WorkOrderCard from './WorkOrderCards';
import { GetSingleWorkOrders } from '../../service/WorkOrderApis/GetSingleWorkOrderApi';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
import Loader from '../LoadingScreen/AnimatedLoader';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getLocationWorkOrder } from '../../service/WorkOrderApis/GetLocationWo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FilteredWorkOrderPage = ({ route, uuids: passedUuid }) => {
  const [loading, setLoading] = useState(false);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [type, setType] = useState(route?.params?.type || null);
  const [uuid, setUuid] = useState(route?.params?.uuid || passedUuid || null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUuidAndType = async () => {
      try {
        if (!uuid || !type) {
          const storedUuid = await AsyncStorage.getItem('uuid');
          const storedType = await AsyncStorage.getItem('type');
          setUuid(storedUuid);
          setType(storedType);
        }
      } catch (error) {
        console.error('Error fetching UUID and type from AsyncStorage:', error);
      }
    };

    fetchUuidAndType();
  }, []);


  const handleBack = ()=>{
        navigation.goBack()
  }



  

  useEffect(() => {
    if (uuid && type) {
      fetchData();
    }
  }, [uuid, type]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      if (type === 'LC') {
        response = await getLocationWorkOrder(uuid);
      } else {
        response = await GetSingleWorkOrders(uuid);
      }
      if (response && response.length > 0) {
        setFilteredWorkOrders(response);
      } else {
        setPopupVisible(true);
      }
    } catch (error) {
      console.error('Error fetching work orders:', error);
      setPopupVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePopupClose = () => {
    setPopupVisible(false);
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <View style={styles.container}>
      {/* Custom Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => handleBack()}
      >
        <FontAwesome name="arrow-left" size={20} color="white" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>



<Text  className="text-center font-bold text-lg">WorkOrders </Text>
      {loading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : (
        <FlatList
          data={filteredWorkOrders}
          keyExtractor={(item) => item.wo['Sequence No']}
          renderItem={({ item }) => (
            <WorkOrderCard workOrder={item} previousScreen={'ScannedWoTag'} />
          )}
          contentContainerStyle={styles.contentContainer}
        />
      )}

      {/* Dynamic Popup for No Work Orders */}
      <DynamicPopup
        visible={isPopupVisible}
        type="warning" // Example type, adjust as needed
        message={`No work orders found for this Asset`}
        onClose={handlePopupClose}
        onOk={handlePopupClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#1996D3', // Light theme color
    borderRadius: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff', // White text for contrast
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 10,
  },
});

export default FilteredWorkOrderPage;
