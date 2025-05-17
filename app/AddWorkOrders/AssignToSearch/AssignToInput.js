import React, { useState } from 'react';
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Animated, TouchableWithoutFeedback, Text, ScrollView, TouchableOpacity } from 'react-native';
import StaffCard from './StaffCards'; // Ensure correct import path
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome for icons

const MainScreen = ({ onSelectStaff }) => { // Accept the onStaffSelect prop
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [showStaffCard, setShowStaffCard] = useState(false); // State to control visibility of StaffCard
  const [StaffHeight, setStaffHeight] = useState(new Animated.Value(0)); // Animated height for the Staff container
  const [selectedStaff, setSelectedStaff] = useState([]); // State for selected Staff

  // Function to handle the selection of an Staff
  const handleSelectStaff = (staff) => {
    // Check if the staff is already selected
    if (!selectedStaff.includes(staff)) {
      setSelectedStaff((prev) => [...prev, staff]); // Add selected staff to the array
      onSelectStaff([...selectedStaff, staff]); // Call the prop function to send the updated Staff to the parent
    }
    setSearchQuery(''); // Clear search input after selection
    setShowStaffCard(false); // Close the StaffCard
    collapseStaffCard(); // Collapse the Staff card after selection
  };

  const changeText = (text) => {
    setSearchQuery(text); // Update search query
    setShowStaffCard(true); // Show StaffCard when typing
    expandStaffCard(); // Expand the Staff card when typing
  };

  // Function to remove a staff from the selected list
  const removestaff = (staffName) => {
    const updatedStaff = selectedStaff.filter((staff) => staff !== staffName); // Remove staff from the array
    setSelectedStaff(updatedStaff); // Update the state
  };

  // Function to expand the Staff card
  const expandStaffCard = () => {
    Animated.timing(StaffHeight, {
      toValue: 200, // Set the height for displaying the StaffCard
      duration: 300,
      useNativeDriver: false, // Height animation doesn't support native driver
    }).start();
  };

  // Function to collapse the Staff card
  const collapseStaffCard = () => {
    Animated.timing(StaffHeight, {
      toValue: 0, // Set height to 0
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust for keyboard avoidance
    >
      <SafeAreaView style={styles.innerContainer}>
        <Text style={styles.title}>Assign Staff</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Staff"
          value={searchQuery} // Display the selected Staff or search query
          onChangeText={changeText} // Update search query
          onFocus={() => setShowStaffCard(true)} // Show StaffCard when focused
        />
        <Animated.View style={[styles.StaffContainer, { height: StaffHeight }]}>
          {showStaffCard && ( // Show StaffCard if it's visible
            <TouchableWithoutFeedback onPress={() => setShowStaffCard(true)}>
              <StaffCard 
                searchQuery={searchQuery} 
                onClose={collapseStaffCard} // Collapse StaffCard
                onSelect={handleSelectStaff} // Pass the handleSelectStaff function
              />
            </TouchableWithoutFeedback>
          )}
        </Animated.View>

        {/* List of selected Staff displayed in a row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedStaffList}>
          {selectedStaff.map((staff) => (
            <View key={staff.user_id} style={styles.selectedstaffContainer}>
              <Text style={styles.selectedstaffText}>{staff.name}</Text>
              <TouchableOpacity onPress={() => removestaff(staff)}>
                <FontAwesome name="remove" size={18} color="#FF4B4B" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  searchInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#1996D3',
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  StaffContainer: {
    overflow: 'hidden', // Hide overflow for smooth animation
  },
  title: {
    fontSize: 16,
    fontWeight: "bold"
  },
  selectedStaffList: {
    marginTop: 5,
    flexDirection: 'row', // Set direction to row for horizontal layout
  },
  selectedstaffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5, // Reduced padding for less space
    marginRight: 10, // Space between Staff
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    backgroundColor: '#F9F9F9',
  },
  selectedstaffText: {
    color: '#074B7C',
    fontSize: 16,
    marginRight: 5, // Space between text and remove icon
  },
});

export default MainScreen;
