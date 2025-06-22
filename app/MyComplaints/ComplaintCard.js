import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import useConvertToSystemTime from '../TimeConvertot/ConvertUtcToIst';
import { useSelector } from 'react-redux';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

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

const ComplaintCard = ({ data, categroy,locations }) => {
  const navigation = useNavigation();
  const { nightMode } = usePermissions();
  const { color, icon } = getStatusStyles(data.status);
  const users = useSelector((state) => state.users.data);
  const createdByName = useMemo(() => {
    const user = users?.find((u) => u.user_id === data.created_by);
    return user?.name || '';
  }, [users, data.created_by]);
  const myCat = useMemo(() => {
    return categroy.find((cat) => cat.id === data.complaint_type) || '';
  }, [categroy, data.complaint_type]);

  const handlePress = () => {
    navigation.navigate('CloseComplaint', {
      complaint: data,
      category: myCat,
      creator: createdByName,
    });
  };


const myLocation = Array.isArray(locations)
  ? locations.find((e) => e.id == data?.constant_society_id)
  : null;
  const colors = {
    bg: nightMode ? '#1e1e1e' : '#fff',
    text: nightMode ? '#e0e0e0' : '#333',
    muted: nightMode ? '#999' : '#666',
    border: nightMode ? '#333' : '#ccc',
    tagBg: nightMode ? '#333' : '#e0f2fe',
    tagText: nightMode ? '#90cdf4' : '#1e40af',
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.card, { borderColor: color, backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <View style={styles.row}>
          <Icon name="file-text" size={14} color={colors.text} />
          <Text style={[styles.complaintNo, { color: colors.text }]}>{data.com_no}</Text>
        </View>
        <View style={[styles.statusContainer, { backgroundColor: color }]}>
          <Icon name={icon} size={12} color="#fff" />
          <Text style={styles.status}>{data.status}</Text>
        </View>
      </View>

      {/* Category */}
      {myCat?.name && (
        <View style={styles.row}>
          <Icon name="list-alt" size={12} color={colors.tagText} />
          <Text style={[styles.label, { color: colors.text }]}>Category:</Text>
          <Text style={[styles.tag, { backgroundColor: colors.tagBg, color: colors.tagText }]}>
            {myCat?.name}
          </Text>
        </View>
      )}

      {/* Description */}
      <Text numberOfLines={2} style={[styles.description, { color: colors.muted }]}>
        {data.description}
      </Text>
      {myLocation?.name && (
        <View style={styles.row}>
          <Icon name="list-alt" size={12} color={colors.tagText} />
          <Text style={[styles.label, { color: colors.text }]}>Location:</Text>
          <Text style={[styles.tag, { backgroundColor: colors.tagBg, color: colors.tagText }]}>
            {myLocation?.name}
          </Text>
        </View>
      )}
      {/* Footer Info */}
      <View style={styles.footer}>
        {createdByName && (
          <View style={styles.infoRow}>
            <Icon name="user" size={12} color={colors.muted} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {createdByName}
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Icon name="calendar" size={12} color={colors.muted} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {useConvertToSystemTime(data.created_at)}
          </Text>
        </View>

        {data?.display_unit_no && (
          <View style={styles.rowBetween}>
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={12} color="#D32F2F" />
              <Text style={[styles.infoText, { color: colors.text }]}>
                D.Unit: {data.display_unit_no}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="link" size={12} color="#F57C00" />
              <Text style={[styles.infoText, { color: colors.text }]}>
                Ref: {data.reference_unit_no ? data.reference_unit_no.slice(0, 12) + '...' : 'N/A'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1.5,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  complaintNo: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  tag: {
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: 'bold',
    maxWidth: '60%',
  },
  description: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 6,
  },
  footer: {
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  infoText: {
    fontSize: 12,
  },
});

export default ComplaintCard;
