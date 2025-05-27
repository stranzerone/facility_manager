import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const getStatusColor = (status) => {
  switch (status) {
    case 'OPEN': return '#4299E1';
    case 'STARTED': return '#ED8936';
    case 'COMPLETED': return '#48BB78';
    case 'HOLD': return '#ECC94B';
    case 'CANCELLED': return '#F56565';
    case 'REOPEN': return '#9F7AEA';
    default: return '#A0AEC0';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Emergency': return '#FF6B6B';
    case 'High': return '#FFA94D';
    case 'Normal': return '#1996D3';
    default: return 'gray';
  }
};

const WorkOrderCard = React.memo(({ workOrder, previousScreen, type, uuid }) => {
  const navigation = useNavigation();
  const statusColor = getStatusColor(workOrder.wo.Status);
  const priorityColor = getPriorityColor(workOrder.wo.Priority);
  const [restricted, setRestricted] = useState(false);
  const [restrictedTime, setRestrictedTime] = useState(0);

  const { ppmAsstPermissions, instructionPermissions, nightMode } = usePermissions();
  const workOrderReadPermission = ppmAsstPermissions?.some((p) => p.includes("R"));

  useEffect(() => {
    const delTime = workOrder.wo.wo_restriction_time;
    const creTime = moment(workOrder.wo["Due Date"]);
    const currTime = moment();
    const timeDiff = currTime.diff(creTime, 'minutes') / 60;

    if (timeDiff >= delTime) {
      setRestricted(true);
      setRestrictedTime(timeDiff);
    } else {
      setRestricted(false);
      setRestrictedTime(delTime - timeDiff);
    }
  }, []);

  const workOrderClick = () => {
    if (instructionPermissions.some((permission) => permission.includes('R'))) {
      if (workOrderReadPermission || uuid) {
        navigation.navigate('BuggyListTopTabs', {
          workOrder: workOrder.wo.uuid,
          wo: workOrder.wo,
          previousScreen: previousScreen,
          restricted: restricted,
          restrictedTime: restrictedTime
        });
      } else {
        navigation.navigate("NewScanPageWo")
          ;
      }
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const dateObj = new Date(dateTimeString.replace(" ", "T"));
    if (isNaN(dateObj)) return 'Invalid Date';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    }).toLowerCase();
    return `${year}/${month}/${day} ${formattedTime}`;
  };

  const fontSize = Platform.OS === 'ios' ? 13 : 13;
  const largeFontSize = Platform.OS === 'ios' ? 16 : 18;
  const cardBgColor = nightMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = nightMode ? '#F3F4F6' : '#1A202C';

  return (
    <TouchableOpacity
      style={{
        backgroundColor: cardBgColor,
        borderColor: '#1996D3',
        padding: 16,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        marginVertical: 6
      }}
      onPress={workOrderClick}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: textColor, fontWeight: 'bold', fontSize }}>ID: {workOrder.wo['Sequence No']}</Text>
          {workOrder.wo['Sequence No'].startsWith('BR') && (
            <View style={{ backgroundColor: '#EF4444', borderRadius: 4, paddingHorizontal: 6, marginLeft: 8 }}>
              <Text style={{ color: '#FFF', fontSize: 10 }}>Breakdown</Text>
            </View>
          )}
          {workOrder.wo['Sequence No'].startsWith('HK') && (
            <View style={{ backgroundColor: '#34D399', borderRadius: 4, paddingHorizontal: 6, marginLeft: 8 }}>
              <Text style={{ color: '#FFF', fontSize: 10 }}>HK</Text>
            </View>
          )}
          {workOrder.wo.wo_restriction_time && (
            <Icon name={restricted ? "flag" : "clock-o"} size={16} color={restricted ? "red" : "gray"} style={{ marginLeft: 6 }} />
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor, marginRight: 6 }} />
          <Text style={{ color: statusColor, fontWeight: 'bold', fontSize }}>{workOrder.wo.Status}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Icon name="cogs" size={fontSize} color="#2563EB" />
        <Text style={{ color: '#2563EB', fontWeight: 'bold', fontSize: largeFontSize, marginLeft: 8 }}>
          {workOrder.wo.Name || 'Unnamed Work Order'}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Icon name="calendar" size={fontSize} color="#1996D3" />
        <Text style={{ color: textColor, fontWeight: 'bold', fontSize, marginLeft: 8 }}>
          {workOrder.wo['Due Date']
            ? (/\d{2}:\d{2}/.test(workOrder.wo['Due Date'])
              ? formatDateTime(workOrder.wo['Due Date'])
              : `${workOrder.wo['Due Date']} 12:00 AM`)
            : 'N/A'}
        </Text>
      </View>

      <View style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: priorityColor,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderBottomRightRadius: 8,
        borderTopLeftRadius: 8,
      }}>
        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize }}>{workOrder.wo.Priority || 'Priority'}</Text>
      </View>
    </TouchableOpacity>
  );
});

export default WorkOrderCard;
