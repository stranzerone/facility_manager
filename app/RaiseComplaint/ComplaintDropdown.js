import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, 
  Dimensions, FlatList, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { GetAllMyComplaints } from '../../service/ComplaintApis/GetMyAllComplaints';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const { width } = Dimensions.get('window');

const ComplaintDropdown = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { notificationsCount } = usePermissions();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await GetAllMyComplaints();
        if (response?.data) {
          setComplaints(Object.values(response.data));
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [notificationsCount]);

  const filteredComplaints = complaints.filter(complaint =>
    complaint.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderComplaintCard = ({ item }) => {
    const [firstLine, secondLine] = item.name.split(' (');
    const firstLetter = firstLine.trim().charAt(0).toUpperCase();

    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.cardContainer} 
        onPress={() => navigation.navigate('subComplaint', { subCategory: item.sub_catagory, category: item })}
      >
        <View style={styles.circleContainer}>
          <Text style={styles.circleText}>{firstLetter}</Text>
        </View>
        <Text style={styles.cardText}>{firstLine.trim()}</Text>
        {secondLine && <Text style={styles.cardText}>{'(' + secondLine}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.flexContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flexContainer}
        >
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchIconContainer}>
              <FontAwesome name="search" size={20} color="white" />
            </View>
            <TextInput
              style={styles.searchBar}
              placeholder="Search Category..."
              placeholderTextColor="#B0B0B0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Complaints List */}
          {loading ? (
            <ActivityIndicator size="large" color="#1996D3" style={styles.loader} />
          ) : (
            <FlatList
              contentContainerStyle={styles.listContainer}
              data={filteredComplaints}
              renderItem={renderComplaintCard}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={<Text style={styles.noResultsText}>No complaints found.</Text>}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 3,
  },
  searchIconContainer: {
    backgroundColor: '#1996D3',
    padding: 15,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  searchBar: {
    flex: 1,
    height: 50,
    fontSize: 16,
    paddingLeft: 10,
    backgroundColor: 'white',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  listContainer: {
    paddingBottom: 150,
    paddingHorizontal: 10,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    aspectRatio: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    margin: 5,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardText: {
    color: '#074B7C',
    fontWeight: 'normal',
    textAlign: 'center',
    marginTop: 5,
    fontSize: Math.max(14, width * 0.04),
    flexWrap: 'wrap',
  },
  circleContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1996D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  circleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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

export default ComplaintDropdown;
