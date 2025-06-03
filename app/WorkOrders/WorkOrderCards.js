import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
// useSelector is imported but not used in this version. Remove if "AssignedTo" is not planned.
// import { useSelector } from 'react-redux';
import moment from 'moment';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const getStatusColor = (status) => {
  switch (status) {
    case 'OPEN': return '#3B82F6';
    case 'STARTED': return '#F97316';
    case 'COMPLETED': return '#22C55E';
    case 'HOLD': return '#EAB308';
    case 'CANCELLED': return '#EF4444';
    case 'REOPEN': return '#8B5CF6';
    default: return '#6B7280';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Emergency': return '#DC2626';
    case 'High': return '#F59E0B';
    case 'Normal': return '#0EA5E9';
    default: return '#6B7280';
  }
};

const WorkOrderCard = React.memo(({ workOrder, previousScreen, type, uuid }) => {
  const navigation = useNavigation();
  // Ensure workOrder and workOrder.wo exist and are objects, or provide defaults
  const wo = workOrder?.wo || {};

  const statusColor = getStatusColor(wo.Status);
  const priorityColor = getPriorityColor(wo.Priority);
  const [restricted, setRestricted] = useState(false);
  const [restrictedTime, setRestrictedTime] = useState(0);

  const { ppmAsstPermissions, instructionPermissions, nightMode } = usePermissions();
  const workOrderReadPermission = ppmAsstPermissions?.some((p) => p.includes("R"));

  useEffect(() => {
    const delTime = wo.wo_restriction_time;
    const dueDateStr = wo["Due Date"];

    if (delTime === null || typeof delTime === 'undefined' || !dueDateStr) {
      setRestricted(false);
      setRestrictedTime(0);
      return;
    }
    
    // Ensure delTime is a number for calculations
    if (typeof delTime !== 'number') {
        console.warn("Restriction time (delTime) is not a number:", delTime);
        setRestricted(false);
        setRestrictedTime(0);
        return;
    }

    const creTime = moment(dueDateStr);
    if (!creTime.isValid()) {
      console.warn("Invalid Due Date for restriction calculation:", dueDateStr);
      setRestricted(false);
      setRestrictedTime(0);
      return;
    }

    const currTime = moment();
    const timeDiff = currTime.diff(creTime, 'minutes') / 60; // Difference in hours

    if (timeDiff >= delTime) {
      setRestricted(true);
      setRestrictedTime(timeDiff); // How long it has been restricted
    } else {
      setRestricted(false);
      // How much time is left until restriction applies
      setRestrictedTime(Math.max(0, delTime - timeDiff));
    }
  }, [wo.wo_restriction_time, wo["Due Date"]]); // Dependencies are correct

  const workOrderClick = () => {
    if (instructionPermissions?.some((permission) => permission.includes('R'))) {
      if (workOrderReadPermission || uuid) {
        navigation.navigate('BuggyListTopTabs', {
          workOrder: wo.uuid, // Use wo.uuid
          wo: wo,             // Pass the safer wo object
          previousScreen: previousScreen,
          restricted: restricted,
          restrictedTime: restrictedTime
        });
      } else {
        navigation.navigate("NewScanPageWo");
      }
    }
  };

  const formatDateTime = (dateTimeInput) => {
    if (!dateTimeInput) return 'N/A';
    // Ensure dateTimeInput is converted to string for robust parsing
    const dateTimeString = String(dateTimeInput);

    // Replace space with T for better cross-platform Date parsing, if space exists
    // Handles "YYYY-MM-DD HH:MM:SS" and "YYYY-MM-DDTHH:MM:SS"
    const parsableDateString = dateTimeString.includes(" ") && !dateTimeString.includes("T")
                               ? dateTimeString.replace(" ", "T")
                               : dateTimeString;

    const dateObj = new Date(parsableDateString);
    if (isNaN(dateObj.getTime())) return 'Invalid Date'; // Check if date is valid

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    }).toLowerCase();
    return `${day}/${month}/${year} ${formattedTime}`;
  };

  const fontSize = Platform.OS === 'ios' ? 13 : 12;
  const largeFontSize = Platform.OS === 'ios' ? 16 : 15;
  
  const cardBgColor = nightMode 
    ? 'rgba(25, 150, 211, 0.12)' 
    : 'rgba(25, 150, 211, 0.06)';
  
  const textColor = nightMode ? '#E0E7FF' : '#1E3A8A';
  const iconColor = nightMode ? '#93C5FD' : '#3B82F6';
  const bubbleRgb = '25, 150, 211';

  const sequenceNo = wo['Sequence No'];
  const woName = wo.Name || 'Unnamed Work Order';
  const woStatus = wo.Status;
  const woPriority = wo.Priority;
  const woDueDate = wo['Due Date'];
  const woRestrictionTime = wo.wo_restriction_time;


  return (
    <TouchableOpacity
      style={{
        backgroundColor: cardBgColor,
        padding: 16,
  
        borderRadius: 12,
        marginVertical: 6,
        marginHorizontal: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
      onPress={workOrderClick}
    >
      <View style={{
        position: 'absolute', top: 20, right: 30, width: 60, height: 60, borderRadius: 30,
        backgroundColor: nightMode ? `rgba(${bubbleRgb}, 0.18)` : `rgba(${bubbleRgb}, 0.10)`,
      }} />
      <View style={{
        position: 'absolute', bottom: 40, left: 20, width: 40, height: 40, borderRadius: 20,
        backgroundColor: nightMode ? `rgba(${bubbleRgb}, 0.15)` : `rgba(${bubbleRgb}, 0.08)`,
      }} />
      <View style={{
        position: 'absolute', top: 70, left: 90, width: 25, height: 25, borderRadius: 12.5,
        backgroundColor: nightMode ? `rgba(${bubbleRgb}, 0.12)` : `rgba(${bubbleRgb}, 0.06)`,
      }} />

      <View style={{ zIndex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
            <Text style={{ color: textColor, fontWeight: '600', fontSize, marginRight: 6 }}>
              ID: {sequenceNo || 'N/A'}
            </Text>
            
            {typeof sequenceNo === 'string' && sequenceNo.startsWith('BR') && (
              <View style={{ backgroundColor: '#FEE2E2', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginRight: 6 }}>
                <Text style={{ color: '#B91C1C', fontSize: 10, fontWeight: 'bold' }}>Breakdown</Text>
              </View>
            )}
            {typeof sequenceNo === 'string' && sequenceNo.startsWith('HK') && (
              <View style={{ backgroundColor: '#D1FAE5', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginRight: 6 }}>
                <Text style={{ color: '#065F46', fontSize: 10, fontWeight: 'bold' }}>HK</Text>
              </View>
            )}
            {woRestrictionTime != null && (
              <Icon name={restricted ? "flag" : "clock-o"} size={14} color={restricted ? "#EF4444" : (nightMode ? '#9CA3AF' : '#6B7280')} />
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor, marginRight: 6 }} />
            <Text style={{ color: statusColor, fontWeight: 'bold', fontSize: fontSize }}>
              {typeof woStatus === 'string' ? woStatus.toUpperCase() : (woStatus || 'N/A')}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Icon name="cogs" size={fontSize + 1} color={iconColor} style={{ marginRight: 8 }} />
        <Text
  style={{
    color: textColor,
    fontWeight: 'bold',
    fontSize: largeFontSize,
    textAlignVertical:'center',
    flex: 1,
  }}
  numberOfLines={2}
  ellipsizeMode="tail"
>
  {woName}
</Text>

        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Icon name="calendar-check-o" size={fontSize + 1} color={iconColor} style={{ marginRight: 8 }} />
          <Text style={{ color: textColor, fontWeight: '600', fontSize, flex: 1 }}>
             {formatDateTime(woDueDate)}
          </Text>
        </View>
      </View>

      <View style={{
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: priorityColor, paddingVertical: 6, paddingHorizontal: 12,
        borderBottomRightRadius: 12, borderTopLeftRadius: 12, zIndex: 2
      }}>
        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize }}>
          {typeof woPriority === 'string' ? woPriority.toUpperCase() : (woPriority || 'NORMAL')}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default WorkOrderCard;