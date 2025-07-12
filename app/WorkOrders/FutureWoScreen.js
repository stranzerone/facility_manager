import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
import { workOrderService } from '../../services/apis/workorderApis';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const ITEMS_PER_PAGE = 10;

const UpcomingWorkOrdersScreen = ({ navigation }) => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(moment().add(1, 'days').toDate());
  const [dateType, setDateType] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [modelVisible, setModelVisible] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const { nightMode } = usePermissions();

  const colors = {
    background: nightMode ? '#121212' : '#fff',
    cardBg: nightMode ? '#1e1e1e' : '#fff',
    text: nightMode ? '#e0e0e0' : '#074B7C',
    mutedText: nightMode ? '#aaa' : '#555',
    border: nightMode ? '#2c2c2c' : '#eee',
    subText: nightMode ? '#bbb' : '#777',
    headerBg: nightMode ? '#1c1c1c' : '#f9f9f9', // updated
  };

  const fetchWorkOrders = async (pageNum = 1, refreshing = false) => {
    if (!hasMore && !refreshing) return;

    if (refreshing) {
      setPage(1);
      setHasMore(true);
      setLoading(true);
    } else if (pageNum === 1) {
      setLoading(true);
    }

    try {
      const formattedFrom = moment(fromDate).format('YYYY-MM-DD');
      const formattedTo = moment(toDate).format('YYYY-MM-DD');
      const response = await workOrderService.getFutureWo(formattedFrom, formattedTo);

      const allWorkOrders = response?.data?.flatMap(item => item.workorders || []);
      const now = moment();

      const sortedData = allWorkOrders
        .filter(item => moment(item['Due Date']).isSameOrAfter(now))
        .sort((a, b) => moment(a['Due Date']).diff(moment(b['Due Date'])));

      const startIdx = (pageNum - 1) * ITEMS_PER_PAGE;
      const endIdx = pageNum * ITEMS_PER_PAGE;
      const paginatedData = sortedData.slice(startIdx, endIdx);

      if (refreshing) {
        setWorkOrders(paginatedData);
      } else {
        setWorkOrders(prev => [...prev, ...paginatedData]);
      }

      setHasMore(endIdx < sortedData.length);
    } catch (err) {
      console.error('Failed to fetch work orders:', err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders(1, true);
  }, [fromDate, toDate]);

  const handleLoadMore = () => {
    if (hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWorkOrders(nextPage);
    } else {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setWorkOrders([]);
    setPage(1);
    setHasMore(true);
    fetchWorkOrders(1, true);
  };

  const handleClick = (date) => {
    setDueDate(moment(date).format('DD MMM YYYY'));
    setModelVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
      onPress={() => handleClick(item['Due Date'])}
    >
      <View style={styles.rowBetween}>
        <Text style={[styles.woNumber, { color: colors.text }]}>{item['Sequence No'] || "N/A"}</Text>
        <Text style={[styles.status, styles.open]}>UPCOMING</Text>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{item.Name}</Text>

      <View style={styles.detailRow}>
        <Ionicons name="calendar" size={16} color={colors.text} />
        <Text style={[styles.detailText, { color: colors.mutedText }]}>
          Due: {moment(item['Due Date']).format('DD MMM YYYY')}
        </Text>
      </View>

      {item.a && (
        <View style={styles.detailRow}>
          <Ionicons name="cog" size={16} color={colors.text} />
          <Text style={[styles.detailText, { color: colors.mutedText }]}>Asset: {item.a}</Text>
        </View>
      )}

      {item.l && (
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color={colors.text} />
          <Text style={[styles.detailText, { color: colors.mutedText }]}>Location: {item.l}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCustomDatePicker = () => {
    const dates = [];
    const today = moment();
    for (let i = 0; i <= 10; i++) {
      dates.push(today.clone().add(i, 'days').toDate());
    }

    const selected = dateType === 'from' ? fromDate : toDate;

    return (
      <View className="flex-row flex-wrap px-3 py-2 bg-gray-100">
        {dates.map((date, index) => {
          const isSelected = moment(date).isSame(selected, 'day');
          const isDisabled =
            dateType === 'to' && fromDate && moment(date).isBefore(moment(fromDate), 'day');

          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                if (!isDisabled) handleDateSelect(date);
              }}
              className={`w-[18%] m-[1%] rounded-xl items-center py-2 border
                ${isSelected ? 'bg-[#074B7C] border-[#074B7C]' : 'bg-white border-[#074B7C]'}
                ${isDisabled ? 'opacity-40' : ''}`}
              disabled={isDisabled}
            >
              <Text
                className={`text-base font-semibold ${
                  isSelected ? 'text-white' : 'text-[#074B7C]'
                }`}
              >
                {moment(date).format('DD')}
              </Text>
              <Text
                className={`text-xs ${
                  isSelected ? 'text-white' : 'text-gray-600'
                }`}
              >
                {moment(date).format('ddd')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const handleDateSelect = (date) => {
    if (dateType === 'from') setFromDate(date);
    else setToDate(date);
    setPickerVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Upcoming WO</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.dateRow}>
        <TouchableOpacity
          className={`${dateType === 'from' ? 'bg-[#074B7C]' : 'bg-[#1996D3]'}`}
          style={styles.dateBox}
          onPress={() => {
            setDateType('from');
            setPickerVisible(true);
          }}
        >
          <Text style={styles.dateLabel}>From</Text>
          <Text style={styles.dateValue}>{moment(fromDate).format('DD MMM')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`${dateType === 'to' ? 'bg-[#074B7C]' : 'bg-[#1996D3]'}`}
          style={styles.dateBox}
          onPress={() => {
            setDateType('to');
            setPickerVisible(true);
          }}
        >
          <Text style={styles.dateLabel}>To</Text>
          <Text style={styles.dateValue}>{moment(toDate).format('DD MMM')}</Text>
        </TouchableOpacity>
      </View>

      {pickerVisible && renderCustomDatePicker()}

      {initialLoad && loading ? (
        <ActivityIndicator size="large" color={colors.text} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={workOrders}
          keyExtractor={(item, index) => item?.['Sequence No']?.toString() || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
          onEndReached={() => {
            setLoading(true);
            handleLoadMore();
          }}
          onEndReachedThreshold={0.3}
          refreshing={loading}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.subText }]}>
                No work orders found for the selected dates
              </Text>
              <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.retryText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={() =>
            loading && !initialLoad ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.text} />
              </View>
            ) : null
          }
        />
      )}

      {modelVisible && (
        <DynamicPopup
          message={
            <Text>
              This work order will be available after its scheduled time. Please check back later.
            </Text>
          }
          type={'warning'}
          onClose={() => setModelVisible(false)}
          onOk={() => setModelVisible(false)}
        />
      )}
    </View>
  );
};

export default UpcomingWorkOrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  dateBox: {
    width: '49%',
    display: 'flex',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dateLabel: {
    color: '#fff',
    fontSize: 13,
  },
  dateValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  card: {
    padding: 16,
    borderRadius: 14,
    marginVertical: 3,
    marginHorizontal: 12,
    borderWidth: 0.5,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  woNumber: {
    fontWeight: 'bold',
    fontSize: 15,
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
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 14,
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
  footerLoader: {
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
