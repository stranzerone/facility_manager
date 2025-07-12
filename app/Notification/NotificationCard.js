import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useConvertToIST from '../TimeConvertot/ConvertUtcToIst';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const NotificationCard = ({ message, createdAt }) => {
  const { nightMode } = usePermissions();

  const colors = {
    background: nightMode ? '#1e1e1e' : '#FFFFFF',
    message: nightMode ? '#e0e0e0' : '#074B7C',
    timestamp: nightMode ? '#aaa' : '#999',
    shadow: '#000',
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background, shadowColor: colors.shadow }]}>
      <Text style={[styles.message, { color: colors.message }]}>{message}</Text>
      <Text style={[styles.createdAt, { color: colors.timestamp }]}>
        {useConvertToIST(createdAt)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderBottomWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 12,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  createdAt: {
    fontSize: 12,
    marginTop: 8,
    alignSelf: 'flex-end',
    fontStyle: 'italic',
  },
});

export default NotificationCard;
