import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const FilterOptions = ({ filters, selectedFilter, applyFilter, closeFilter }) => {
  const slideAnim = useRef(new Animated.Value(300)).current; // Start position for slide-in animation

  useEffect(() => {
    // Slide up animation when the component mounts
    Animated.timing(slideAnim, {
      toValue: 0, // End position at the top (0 means fully visible)
      duration: 300, // Animation duration
      useNativeDriver: true, // Use native driver for smoother performance
    }).start();
  }, [slideAnim]);

  const handleClose = () => {
    // Slide down animation when closing
    Animated.timing(slideAnim, {
      toValue: 300, // Slide it back to the starting point (300 means off-screen)
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      closeFilter(); // Call closeFilter after the animation completes
    });
  };

  return (
    <Animated.View style={[styles.filterPopup, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.titleContainer}>
        <Text style={styles.modalTitle}>Filter by Status</Text>
        <TouchableOpacity onPress={handleClose}>
          <Icon name="close" size={20} color="#074B7C" style={styles.closeIcon} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filters}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterOption, selectedFilter === item && styles.selectedFilter]}
            onPress={() => applyFilter(item)}
          >
            <Text style={[styles.filterText, selectedFilter === item && styles.selectedText]}>{item}</Text>
            {selectedFilter === item && (
              <Icon name="check" size={18} color="#fff" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        )}
      />
    </Animated.View>
  );
};

// Styles
const styles = StyleSheet.create({
  filterPopup: {
    position: 'absolute',
    bottom: 50, // Position it at the bottom initially
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    zIndex: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#074B7C',
  },
  closeIcon: {
    marginLeft: 10,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
  },
  filterText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFilter: {
    backgroundColor: '#074B7C',
    borderColor: '#074B7C',
    borderWidth: 1,
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkIcon: {
    marginLeft: 10,
  },
});

export default FilterOptions;
