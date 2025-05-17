import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, FlatList, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Import icons from FontAwesome
import { useNavigation } from '@react-navigation/native';

const SubComplaint = ({ route }) => {
  const { subCategory } = route.params;
  const {category} = route.params;
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [loading, setLoading] = useState(false); // State for loading indicator
  const navigation = useNavigation();


  // Filter complaints based on search query
  const filteredComplaints = subCategory.filter(complaint =>
    complaint.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render a list card for each complaint category
  const renderComplaintCard = ({ item }) => {
    // Split the complaint name into two parts
    const [firstLine, secondLine] = item.name.split(' (');
    const firstLetter = firstLine.trim().charAt(0).toUpperCase(); // Get the first letter of the first line

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.cardContainer}
        onPress={() => navigation.navigate('complaintInput', { subCategory: item ,category:category})}
      >
        <View style={styles.circleContainer}>
          <Text style={styles.circleText}>{firstLetter}</Text>
        </View>
        <View>
          <Text style={styles.cardText}>{firstLine.trim()}</Text>
          {secondLine && <Text style={styles.cardText}>{'(' + secondLine}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search Sub Category..."
          placeholderTextColor="#B0B0B0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FontAwesome name="search" size={20} color="#074B7C" style={styles.searchIcon} />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#1996D3" style={styles.loader} />
      ) : (
        <FlatList
        key="single-column" // Assign a unique key
        data={filteredComplaints}
        renderItem={renderComplaintCard}
        keyExtractor={(item) => item.id.toString()} // Use id as key
        ListEmptyComponent={<Text style={styles.noResultsText}>No complaints found.</Text>} // Show when no complaints match the filter
        showsVerticalScrollIndicator={false} // Hide vertical scroll indicator
      />
      
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9', // Light background for the whole view
    paddingBottom:60,
    paddingHorizontal:20
    
    

  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 0,
    paddingHorizontal: 10, // Horizontal padding for the container
    paddingBottom:15
  },
  searchBar: {
    flex: 1,
    height: 50, // Increased height for better visibility
    backgroundColor: '#FFFFFF', // White background for the search bar
    borderColor: '#1996D3',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 40, // Added left padding for space with the icon
    fontSize: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 25, // Position the icon inside the input
    top: 15, // Center the icon vertically within the TextInput
  },
  cardContainer: {
    flexDirection: 'row', // Make items align horizontally
    alignItems: 'center',
    backgroundColor: '#1996D3', // Primary theme color for the card
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  circleContainer: {
    width: 50, // Width of the circle
    height: 50, // Height of the circle
    borderRadius: 25, // Make it circular
    backgroundColor: '#074B7C', // Dark theme color for the circle
    justifyContent: 'center', // Center the text vertically
    alignItems: 'center', // Center the text horizontally
    marginRight: 10, // Space between circle and text
  },
  circleText: {
    color: '#FFFFFF', // White color for the letter
    fontSize: 18, // Font size for the letter
    fontWeight: 'bold', // Bold weight for the letter
  },
  cardText: {
    color: '#FFFFFF', // White text for better contrast
    fontSize: 16,
    fontWeight: 'bold', // Bold text for emphasis
    flexWrap: 'wrap', // Ensure text wraps properly
  },
  noResultsText: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
  },
});

export default SubComplaint;
