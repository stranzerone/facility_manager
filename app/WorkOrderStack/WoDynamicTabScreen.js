import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import WorkOrderPage from '../WorkOrders/WorkOrderScreen';
import AccessDeniedScreen from './AccessDeniedScreen';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const WorkOrderHomeTab = () => {
  const { ppmAsstPermissions } = usePermissions();
  const navigation = useNavigation();
  // Refresh logic that will run every time the tab is focused
  useFocusEffect(
    useCallback(() => {
    }, [])
  );


  return (
    <View style={styles.container}>
      {ppmAsstPermissions && ppmAsstPermissions.some(permission => permission.includes('R')) ? (
        // Use paramUuId if present, otherwise use stored uuid
        <WorkOrderPage nullUuId={null} />
      ) : (
        <AccessDeniedScreen  /> // Pass the refresh function
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Make the container take the full available space
  },
});

export default WorkOrderHomeTab;
