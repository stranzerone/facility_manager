import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import useConvertToSystemTime from '../TimeConvertot/ConvertUtcToIst';
import { useSelector } from 'react-redux';

const getStatusStyles = (status) => {
  switch (status) {
    case 'Open': return { color: '#4CAF50', icon: 'folder-open' };
    case 'Hold': return { color: '#FFC107', icon: 'pause-circle' };
    case 'Cancelled': return { color: '#F44336', icon: 'times-circle' };
    case 'WIP': return { color: '#2196F3', icon: 'cogs' };
    case 'Closed': return { color: '#9E9E9E', icon: 'lock' };
    case 'Reopen': return { color: '#FF9800', icon: 'refresh' };
    case 'Completed': return { color: '#673AB7', icon: 'check-circle' };
    case 'Resolved': return { color: '#009688', icon: 'wrench' };
    case 'Working': return { color: '#3F51B5', icon: 'briefcase' };
    default: return { color: '#074B7C', icon: 'question-circle' };
  }
};



const ComplaintCard = ({ data,categroy }) => {
  const navigation = useNavigation();
  const { color, icon } = getStatusStyles(data.status);
// const [myCat,setMyCat] = useState('')
  const handlePress = () => {
    navigation.navigate('CloseComplaint', { complaint: data, category: myCat,creator :createdByName});
  };


  
  const users = useSelector((state) => state.users.data);

const getUserNames = (assignedId) => {
  if (!assignedId) {
    return false;
  }

  if (users[0] === 'success') {
    const user = users[1]?.find((user) => user.user_id === assignedId);
    return user ? user.name : null;
  }

  return false;
};


const myCat = useMemo(() => {
  return categroy.find((cat) => cat.id === data.complaint_type)?.name || "";
}, [categroy, data.complaint_type]);


const createdByName = getUserNames(data.created_by);




  return (
    <TouchableOpacity onPress={handlePress} style={[styles.card, { borderColor: color }]}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Icon name="file-text" size={20} color="#333" />
        <Text style={styles.complaintNo}>{data.com_no}</Text>
        <View style={[styles.statusContainer, { backgroundColor: color }]}>
          <Icon name={icon} size={14} color="#fff" />
          <Text style={styles.status}>{data.status}</Text>
        </View>
      </View>



<View>
{myCat && <View className="flex flex-row gap-1 items-center my-2" >
<Icon name="list-alt" size={16} color="#60A5FA" />

<Text className="font-bold">Category : </Text>
<Text 
  className="bg-blue-400 rounded-lg text-white font-bold max-w-[70%] px-1 py-1"
  numberOfLines={1}
  ellipsizeMode="tail"
>
  {myCat}
</Text>
</View>}
</View>
      {/* Description (Truncated) */}
      <Text style={styles.description} numberOfLines={2}>{data.description}</Text>


      <View style={styles.footerContainer}>

     { createdByName &&  <View style={styles.infoItem}>
          <Icon name="user" size={16} color="#074B7C" />
          <Text className="font-bold" style={styles.infoText}>Created By: {createdByName}</Text>
        </View>}
     
        <View style={styles.infoItem}>
          <Icon name="calendar" size={16} color="#34A853" />
          <Text style={styles.infoText}>{useConvertToSystemTime(data.created_at)}</Text>
        </View>

        {/* Display Unit & Reference Unit in One Row */}
    { data?.display_unit_no &&    <View style={styles.rowContainer}>
          <View style={styles.infoItem}>
            <Icon name="map-marker" size={16} color="#D32F2F" />
            <Text className='font-bold' style={styles.infoText}>D.Unit: {data.display_unit_no || 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="link" size={16} color="#F57C00" />
            <Text className='font-bold' style={styles.infoText}>
  Ref. Unit: {data.reference_unit_no ? data.resource.reference_unit_no.slice(0, 10)+"..." : 'N/A'}
</Text>
          </View>
        </View>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  complaintNo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  footerContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Ensures items are in the same row
    marginTop: 8,
  },
});

export default ComplaintCard;
