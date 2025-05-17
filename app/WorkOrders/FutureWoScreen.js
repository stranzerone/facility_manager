import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { GetFutureWorkOrders } from '../../service/WorkOrderApis/GetFutureWorkOrder';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
const UpcomingWorkOrdersScreen = ({ navigation }) => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(moment().add(10, 'days').toDate());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [dateType, setDateType] = useState(null); // 'from' or 'to'
const[modelVisible,setModelVisible] = useState(false)
const [dueDate,setDueDate] = useState('')
  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const formattedFrom = moment(fromDate).format('YYYY-MM-DD');
      const formattedTo = moment(toDate).format('YYYY-MM-DD');
      const data = await GetFutureWorkOrders(formattedFrom, formattedTo);
  
      // Sort data by 'Due Date' in ascending order
      const sortedData = data?.sort((a, b) =>
        moment(a['Due Date']).diff(moment(b['Due Date']))
      );
  
      setWorkOrders(sortedData);
    } catch (err) {
      console.error('Failed to fetch work orders:', err);
    } finally {
      setLoading(false);
    }
  };
  
  
  

  useEffect(() => {
    fetchWorkOrders();
  }, [fromDate, toDate]);

  const onRefresh = () => {
    fetchWorkOrders();
  };

  const onChangeDate = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      if (dateType === 'from') setFromDate(selectedDate);
      else setToDate(selectedDate);
    }
  };

  const handleClick = (date) => {
    setDueDate(moment(date).format('DD MMM YYYY'))
    setModelVisible(true)
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={()=>handleClick(item['Due Date'])}>
      <View style={styles.rowBetween}>
        <Text style={styles.woNumber}>{item['Sequence No']||"N/A"}</Text>
        <Text style={[styles.status,styles.open]}>
        UPCOMING
        </Text>
      </View>

      <Text style={styles.title}>{item.Name}</Text>

      <View style={styles.detailRow}>
        <Ionicons name="calendar" size={16} color="#074B7C" />
        <Text style={styles.detailText}>
          Due: {moment(item['Due Date']).format('DD MMM YYYY')}
        </Text>
      </View>

      {item.a && (
        <View style={styles.detailRow}>
          <Ionicons name="cog" size={16} color="#074B7C" />
          <Text style={styles.detailText}>Asset: {item.a}</Text>
        </View>
      )}

      {item.l && (
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color="#074B7C" />
          <Text style={styles.detailText}>Location: {item.l}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#074B7C" />
        </TouchableOpacity>

        <Text style={styles.screenTitle}>Upcoming WO</Text>

        <View style={styles.dateControls}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              setDateType('from');
              setShowPicker(true);
            }}>
            <Text style={styles.dateText}>{moment(fromDate).format('DD MMM')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              setDateType('to');
              setShowPicker(true);
            }}>
            <Text style={styles.dateText}>{moment(toDate).format('DD MMM')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={dateType === 'from' ? fromDate : toDate}
          mode={pickerMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          maximumDate={moment().add(10, 'days').toDate()}
          onChange={onChangeDate}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#074B7C" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={workOrders}
          keyExtractor={(item, index) => item?.['Sequence No']?.toString() || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No work orders found for the selected dates</Text>
              <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.retryText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          }
          refreshing={loading}
          onRefresh={onRefresh}
        />
      )}

      <View>
        {modelVisible &&
          <DynamicPopup  
          message={  <Text>
            Workorder is due at{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {dueDate}
            </Text>
            {'   '}  wait till due date to start work order
          </Text>}
          type={'warning'}
          onClose={() => setModelVisible(false)}
          onOk={()=> setModelVisible(false)}
          />
        }
      </View>
    </View>
  );
};

export default UpcomingWorkOrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#074B7C',
  },
  dateControls: {
    flexDirection: 'row',
    gap: 6,
  },
  dateButton: {
    backgroundColor: '#1996D3',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  dateText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  listContainer: {
    paddingBottom: 70,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginVertical: 3,
    marginHorizontal: 12,
    borderWidth: 0.5,

    // elevation: 3,
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // shadowOffset: { width: 0, height: 2 },
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  woNumber: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#074B7C',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    textTransform: 'uppercase',
  },
  open: {
    backgroundColor: '#dff0d8',
    color: '#3c763d',
  },
  closed: {
    backgroundColor: '#f2dede',
    color: '#a94442',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    marginLeft: 6,
    color: '#555',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1996D3',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
});
