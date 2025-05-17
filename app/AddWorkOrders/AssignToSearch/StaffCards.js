import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { filterAssets, selectFilteredAssets } from '../../../utils/Slices/AssetSlice.js'; // Adjust the import path
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const StaffCard = ({ searchQuery, onClose, onSelect }) => {
  const dispatch = useDispatch();
  const staff = useSelector(selectFilteredAssets); // Select filtered assets from Redux

  useEffect(() => {
    // Dispatch the filterAssets action whenever searchQuery changes
    dispatch(filterAssets(searchQuery));
  }, [searchQuery, dispatch]);

  const handleSelectStaff = (staffMember) => {
    onSelect(staffMember); 
    onClose();
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <FontAwesome name="close" size={24} color="#B0BEC5" />
      </TouchableOpacity>

      {staff && staff.length > 0 ? (
        staff.map((item) => (
          <TouchableOpacity
            key={item.user_id} // Unique key for each item
            style={styles.staffItem}
            onPress={() => handleSelectStaff(item)} // Handle staff selection
          >
            <View style={styles.staffInfoContainer}>
              <Text style={styles.staffText}>{item.name}</Text>
              <View style={styles.roleContainer}>
                <FontAwesome name={"user"} size={16} color="#074B7C" style={styles.roleIcon} />
                <Text style={styles.roleText}>{item.role_name}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noStaffsText}>No staffs found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    zIndex: 10000,
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#1996D3',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  staffItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginVertical: 5,
  },
  staffInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffText: {
    color: '#074B7C',
    fontSize: 16,
    fontWeight: '500',
    width: '70%', // Takes up 70% of the space
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'start',
    width: '30%', // Takes up 30% of the space
    justifyContent: 'flex-start', // Align items to the right within this container
  },
  roleIcon: {
    marginRight: 5,
  },
  roleText: {
    color: '#074B7C',
    fontSize: 14,
  },
  noStaffsText: {
    color: '#B0BEC5',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default StaffCard;
