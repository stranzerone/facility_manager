import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const getStatusColor = (status) => {
  switch (status) {
    case 'OPEN':
      return '#4299E1';
    case 'STARTED':
      return '#ED8936';
    case 'COMPLETED':
      return '#48BB78';
    case 'HOLD':
      return '#ECC94B';
    case 'CANCELLED':
      return '#F56565';
    case 'REOPEN':
      return '#9F7AEA';
    default:
      return '#A0AEC0';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Emergency':
      return '#FF6B6B';
    case 'High':
      return '#FFA94D';
    case 'Normal':
      return '#1996D3';
    default:
      return 'gray';
  }
};

const WorkOrderCard = React.memo(({ workOrder,previousScreen,type,uuid }) => {
  const navigation = useNavigation();
  const statusColor = getStatusColor(workOrder.wo.Status);
  const priorityColor = getPriorityColor(workOrder.wo.Priority);
  const users = useSelector((state) => state.users.data);
  const teams = useSelector((state) => state.teams.data);
  const [restricted,setRestricted]  = useState(false)
  const [restrictedTime,setRestrictedTime]  = useState(0)

  
    const { ppmAsstPermissions,instructionPermissions } = usePermissions();
    const workOrderReadPermission = ppmAsstPermissions?.some((p) => p.includes("R"));
  const getUserNames = (assignedIds) => {
    if (!assignedIds || assignedIds.length === 0) {
      return 'Team';
    }

    return assignedIds
      .map((userId) => {
        if (users[0] === 'success') {
          const user = users[1]?.find((user) => user.user_id === userId);
          return user ? user.name : null;
        }
        return 'User Not Found';
      })
      .join(', ');
  };



  const getTeamName = (assignedTeamIds) => {
  
    if (!assignedTeamIds || assignedTeamIds.length === 0) {
      return null;
    }
  
    return assignedTeamIds
      .map((teamId) => {
        if (teamId) {
          // Find the team in the teams array based on teamId
          const team = teams?.find((team) => team.t._ID === teamId);
          return team ? team.t.Name : null;
        }
        return 'User Not Found';
      })
      .join(', ');
  };
  

  


  useEffect(() => {
    // Get restriction time (in hours)
    const delTime = workOrder.wo.wo_restriction_time; // Time in hours
  
    // Parse created time as UTC
    const creTime = moment(workOrder.wo["Due Date"]);
  
    const currTime = moment(); // Get current local time
  
    const timeDiff = currTime.diff(creTime, 'minutes') / 60; // Calculate difference in minutes, then convert to hours
  
      
    if (timeDiff >= delTime) {
      setRestricted(true); // Set restricted if the time difference exceeds the restriction time
      setRestrictedTime(timeDiff)

     } else if(timeDiff < delTime){
      setRestricted(false); // Set restricted if the time difference exceeds the restriction time
      setRestrictedTime(delTime - timeDiff)
     
    }else{
      setRestrictedTime(null)

      setRestricted(false)
    }

    }, []);








const workOrderClick=()=>{



  if(instructionPermissions.some((permission) => permission.includes('R'))){

 if(workOrderReadPermission || uuid){
    navigation.navigate('BuggyListTopTabs', {
      workOrder: workOrder.wo.uuid,
      wo: workOrder.wo,
      previousScreen:previousScreen,
      restricted:restricted,
      restrictedTime:restrictedTime
    });
  }else{
    navigation.navigate("QRCode", {
      screen: "NewScanPage",
      params: { screenType: "OW" },
    })  }
  
  }
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return 'N/A';

  // Convert "2025-04-01 11:00:00" to a Date object
  const dateObj = new Date(dateTimeString.replace(" ", "T")); // Ensure proper format for Date parsing

  if (isNaN(dateObj)) return 'Invalid Date';

  // Extract YYYY, MM, DD
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(dateObj.getDate()).padStart(2, '0');

  // Format time as HH:MM am/pm
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toLowerCase();

  return `${year}/${month}/${day} ${formattedTime}`;
}


  const fontSize = Platform.OS === 'ios' ? 13 : 13;
  const largeFontSize = Platform.OS === 'ios' ? 16 : 18;
  return (
    <TouchableOpacity
    className={`bg-white border p-4 rounded-md shadow-lg my-1 relative ${(workOrderReadPermission || uuid )?"bg-white":"bg-gray-200"}`}
    style={{ borderColor: 'darkblue',
     }}
    onPress={workOrderClick}
 
  >
  
      {/* Work Order ID and status */}
      <View className="flex-row justify-between items-center">
        <View className="flex flex-row gap-4">
    

        <View className='flex flex-row'>
        <Text className="text-gray-600 font-bold" style={{ fontSize }}>
          ID : {workOrder.wo['Sequence No']} 
        </Text>
      {workOrder.wo['Sequence No'].split('-')[0] == 'BR' &&  <View className='bg-red-400 rounded-lg text-white ml-2 px-1'>
          <Text className='text-white text-xs font-black'>breakdown</Text>
        </View>}
        {workOrder.wo['Sequence No'].split('-')[0] == 'HK' &&  <View className='bg-green-400 rounded-lg text-white ml-2 px-1'>
          <Text className='text-white text-xs font-black'>HK</Text>
        </View>}
        </View>
        {workOrder.wo.wo_restriction_time && restricted ?

               <Icon name="flag" size={16} color="red"  />
       
       :  workOrder.wo.wo_restriction_time ?


<Icon name="clock-o" size={16} color="gray"  />:
null

}
        </View>
    
        <View className="flex-row items-center">
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 6,
              backgroundColor: statusColor,
              marginRight: 4,
              shadowColor: statusColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.7,
              shadowRadius: 6,
              elevation: 4,
            }}
          />
          <Text className="font-extrabold" style={{ fontSize, color: statusColor }}>
            {workOrder.wo.Status}
          </Text>
        </View>
      </View>

      {/* Work Order Name */}
      <View className="flex-row items-center my-2">
        <Icon name="cogs" size={fontSize} color="#074B7C" />
        <Text className="text-blue-800 font-bold ml-2" style={{ fontSize: largeFontSize }}>
          {workOrder.wo.Name || 'Unnamed Work Order'}
        </Text>
      </View>

{/* Assigned To */}
{(users[0] !== "error" && workOrder.wo.Assigned) || workOrder.wo.AssignedTeam ? (
  <View className="flex flex-row">
    <View className="flex-row w-1/3 items-center">
      <Icon name="user" size={fontSize} color="#1996D3" />
      <Text className="text-gray-700 font-extrabold ml-2" style={{ fontSize }}>
        Assigned To :
      </Text>
    </View>
    <View className="flex-row flex-wrap w-3/4 ml-2 mt-1">
      {/* Assigned Users */}
      {users[0] !== "error" &&
        workOrder.wo.Assigned &&
        getUserNames(workOrder.wo.Assigned).split(", ").map((name, index) => (
          <View key={`user-${index}`} className="bg-blue-100 rounded-md flex items-center justify-center text-xs mb-1 ml-1 mr-1 px-2 py-0.5">
            <Text className="font-semibold text-center" style={{ fontSize }}>
  {name}
</Text>

          </View>
        ))}
      {/* Assigned Team */}
      {workOrder.wo.AssignedTeam &&
        getTeamName(workOrder.wo.AssignedTeam).split(", ").filter((name) => name && name.trim() !== "").map((name, index) => (
          <View
          key={`team-${index}`}
          className="bg-green-200 rounded-md flex items-center justify-center text-xs mb-1 ml-1 mr-1 px-2 py-0.5"
          style={{ maxWidth: 110 }} // Adjust maxWidth as needed
        >
          <Text
            className="text-green-800 font-semibold"
            style={{ fontSize }}
       
          >
  {name}
  </Text>
        </View>
        
        ))}
    </View>
  </View>
) : null}
      


      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Icon name="calendar" size={fontSize} color="#1996D3" />
          <Text className="text-gray-700 font-extrabold ml-2" style={{ fontSize }}>
  {workOrder.wo['Due Date'] 
    ? (/\d{2}:\d{2}/.test(workOrder.wo['Due Date']) 
        ?formatDateTime(workOrder.wo['Due Date'])
        : `${workOrder.wo['Due Date']} 12:00 AM`) 
    : 'N/A'}
</Text>

        </View>
      </View>

      {/* Priority Badge */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          backgroundColor: priorityColor,
          paddingVertical: 4,
          paddingHorizontal: 8,
          minWidth: 80,
          borderBottomRightRadius: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text className="font-black" style={{ fontSize, color: '#FFF' }}>
          {workOrder.wo.Priority || 'Unknown Priority'}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default WorkOrderCard;
