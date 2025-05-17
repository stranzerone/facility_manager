import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { WorkOrderInfoApi } from '../../service/WorkOrderInfoApi';
import useConvertToSystemTime from '../TimeConvertot/ConvertUtcToIst';

const AssetInfo = ({ WoUuId }) => {
  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamInfo, setTeamInfo] = useState(null);
  const [namesAssigned, setNames] = useState([]);
  const [timeInfo, setTimeInfo] = useState("1");

  // Fetch user and team data from Redux
  const users = useSelector((state) => state.users.data);
  const teams = useSelector((state) => state.teams.data);

  // Fetch work order data
  useEffect(() => {
    const loadWorkOrderData = async () => {
      try {
        const data = await WorkOrderInfoApi(WoUuId);
        setWorkOrder(data);

        // if (data && data[0]?.pm?.AssignedTeam?.length && teams) {
        //   const teamId = data[0].pm.AssignedTeam[0];
        //   teams.forEach(element => {
        //     if (element.t?._ID == teamId) {
        //       setTeamInfo(element);
        //     }
        //   });
        // }

      } catch (error) {
        console.error('Error fetching work order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrderData();
  }, [WoUuId, teams]);

  const getTeamName = (assignedTeamIds) => {
    if (!assignedTeamIds || assignedTeamIds.length === 0) {
      return null;
    }
    return assignedTeamIds
      .map((teamId) => {
        if (teamId) {
          // Find the team in the teams array based on teamId
          const team = teams?.find((team) => team.t._ID === teamId);
          return team ? team.t.Name : 'Team Not Found';
        }
        return 'Team Not Found';
      })
      .join(', ');
  };
  
  // Map user IDs to user names for assigned users
  useEffect(() => {
    if (users[0] !== 'error' && workOrder && workOrder[0]?.wo?.Assigned && users[1]) {
      const assignedUserIds = workOrder[0].wo.Assigned;
      const assignedNames = assignedUserIds
        ?.map((id) => {
          const user = users[1]?.find((user) => user.user_id === id);
          return user ? user.name : 'Unknown User';
        })
        .join(', ') || 'None';
      const assignedTeamIds = workOrder[0]?.wo?.AssignedTeam || []; // Check the correct key
      const teamNames = getTeamName(assignedTeamIds) || '';
      setNames(assignedNames + (teamNames ? ` , ${teamNames}` : ''));
    }
  }, [users, workOrder, teams]);
  
  

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1996D3" />
      </View>
    );
  }

  // Show error message if no data is found
  if (!workOrder || workOrder.length === 0) {
    return <Text style={styles.errorText}>No work order data found.</Text>;
  }

  // Extract work order and asset details
  const { asset, wo, category } = workOrder[0];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.textContainer}>
            <Text style={styles.headerText}>{wo?.['Sequence No']}</Text>
            <Text style={styles.headerSubText}>{wo?.Name}</Text>
          </View>
        </View>

        {/* Description Section */}
        <View className="border-gray-400 border-t max-h-20 mt-2 overflow-hidden pt-2">
  <ScrollView 
    className="px-2" 
    contentContainerStyle={{ flexGrow: 1 }}
    showsVerticalScrollIndicator={true}
  >
    <Text style={styles.descriptionText}>
      {wo?.Description || "No description available for this work order."}
    </Text>
  </ScrollView>
</View>


        <View style={styles.infoContainer}>
          {/* Work Order Details */}
          <View style={styles.detailsContainer}>
            <DetailItem icon="assignment" label="Asset Name" text={asset?.Name} />
            <DetailItem icon="hashtag" label="Asset ID" text={asset?.['Sequence No']} />
            {/* <DetailItem icon="calendar" label="Deadline" text={workOrder[0].wo["Due Date"] || 'No Deadline Provided'} /> */}
            <DetailItem icon="wrench" label="Type" text={wo?.Type} />
            <DetailItem icon="tags" label="Category Of Wo" text={category?.Name} />
            <DetailItem icon="clock-o" label="Estimated Time" text={workOrder[0].wo['Estimated Time'] + "  hours"} isTag />

            {/* Assigned To */}
            {namesAssigned && (
              <DetailItem icon="user" label="Assigned To" text={namesAssigned} isTag />
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const DetailItem = ({ icon, label, text, isTag }) => (
  <View style={styles.detailItem}>
    <View style={styles.iconContainer}>
      {icon === 'assignment' ? (
        <MaterialIcons name={icon} size={24} color="#074B7C" />
      ) : (
        <FontAwesome name={icon} size={24} color="#074B7C" />
      )}
    </View>
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={[styles.detailText, isTag && styles.tagText]}>{text || 'N/A'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    height:"120%",
    paddingBottom:80
  },
  scrollViewContent: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 16,
  },
  textContainer: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#074B7C',
  },
  headerSubText: {
    fontSize: 16,
    color: '#1996D3',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f1ff',
    borderWidth: 0.3,
    borderRadius: 1,
    padding: 12,
    marginBottom: 0,
  },
  iconContainer: {
    marginRight: 10,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#074B7C',
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#1996D3',
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#074B7C',
  },
  descriptionBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderColor: '#d3d3d3',
    borderWidth: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
  },
});

export default AssetInfo;
