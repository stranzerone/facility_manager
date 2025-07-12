import { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, 
  Dimensions, FlatList, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePermissions } from '../GlobalVariables/PermissionsContext';
import { complaintService } from '../../services/apis/complaintApis';

const { width } = Dimensions.get('window');

const ComplaintDropdown = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { notificationsCount, nightMode } = usePermissions();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await complaintService.getComplaintCategories();
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
        style={[styles.cardContainer, nightMode && styles.cardContainerDark]} 
        onPress={() => navigation.navigate('subComplaint', { subCategory: item.sub_catagory, category: item })}
      >
        <View style={[styles.circleContainer, nightMode && styles.circleContainerDark]}>
          <Text style={styles.circleText}>{firstLetter}</Text>
        </View>
        <Text style={[styles.cardText, nightMode && styles.cardTextDark]}>{firstLine.trim()}</Text>
        {secondLine && <Text style={[styles.cardText, nightMode && styles.cardTextDark]}>{'(' + secondLine}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.flexContainer, nightMode && styles.flexContainerDark]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flexContainer}
        >
          {/* Search Bar */}
          <View style={[styles.searchContainer, nightMode && styles.searchContainerDark]}>
            <View style={[styles.searchIconContainer, nightMode && styles.searchIconContainerDark]}>
              <FontAwesome name="search" size={20} color="white" />
            </View>
            <TextInput
              style={[styles.searchBar, nightMode && styles.searchBarDark]}
              placeholder="Search Category..."
              placeholderTextColor={nightMode ? "#888" : "#B0B0B0"}
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
              ListEmptyComponent={<Text style={[styles.noResultsText, nightMode && styles.noResultsTextDark]}>No complaints found.</Text>}
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
  },
  flexContainerDark: {
    backgroundColor: '#121212',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 3,
  },
  searchContainerDark: {
    backgroundColor: '#1E1E1E',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIconContainer: {
    backgroundColor: '#1996D3',
    padding: 15,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  searchIconContainerDark: {
    backgroundColor: '#1565A1',
  },
  searchBar: {
    flex: 1,
    height: 50,
    fontSize: 16,
    paddingLeft: 10,
    backgroundColor: 'white',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    color: '#000',
  },
  searchBarDark: {
    backgroundColor: '#1E1E1E',
    color: '#E5E5EA',
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
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  cardContainerDark: {
    backgroundColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOpacity: 0.6,
  },
  cardText: {
    color: '#074B7C',
    fontWeight: 'normal',
    textAlign: 'center',
    marginTop: 5,
    fontSize: Math.max(14, width * 0.04),
    flexWrap: 'wrap',
  },
  cardTextDark: {
    color: '#E5E5EA',
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
  circleContainerDark: {
    backgroundColor: '#1565A1',
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
  noResultsTextDark: {
    color: '#888',
  },
  loader: {
    marginTop: 20,
  },
});

export default ComplaintDropdown;
