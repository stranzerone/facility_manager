import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, FlatList 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const SubComplaint = ({ route }) => {
  const { subCategory, category } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { nightMode } = usePermissions();

  const filteredComplaints = subCategory.filter(complaint =>
    complaint.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderComplaintCard = ({ item }) => {
    const [firstLine, secondLine] = item.name.split(' (');
    const firstLetter = firstLine.trim().charAt(0).toUpperCase();

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.cardContainer, nightMode && styles.cardContainerDark]}
        onPress={() => navigation.navigate('complaintInput', { subCategory: item, category })}
      >
        <View style={[styles.circleContainer, nightMode && styles.circleContainerDark]}>
          <Text style={styles.circleText}>{firstLetter}</Text>
        </View>
        <View>
          <Text style={[styles.cardText, nightMode && styles.cardTextDark]}>{firstLine.trim()}</Text>
          {secondLine && <Text style={[styles.cardText, nightMode && styles.cardTextDark]}>{'(' + secondLine}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, nightMode && styles.containerDark]}>
      <View style={[styles.searchContainer, nightMode && styles.searchContainerDark]}>
        <TextInput
          style={[styles.searchBar, nightMode && styles.searchBarDark]}
          placeholder="Search Sub Category..."
          placeholderTextColor={nightMode ? '#888' : '#B0B0B0'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FontAwesome
          name="search"
          size={20}
          color={nightMode ? '#E5E5EA' : '#074B7C'}
          style={styles.searchIcon}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#1996D3" style={styles.loader} />
      ) : (
        <FlatList
          key="single-column"
          data={filteredComplaints}
          renderItem={renderComplaintCard}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={[styles.noResultsText, nightMode && styles.noResultsTextDark]}>
              No complaints found.
            </Text>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 20,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 0,
    paddingHorizontal: 10,
    paddingBottom: 15,
  },
  searchContainerDark: {
    borderBottomColor: '#444',
    borderBottomWidth: 1,
  },
  searchBar: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderColor: '#1996D3',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 40,
    fontSize: 16,
    color: '#000',
  },
  searchBarDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#444',
    color: '#E5E5EA',
  },
  searchIcon: {
    position: 'absolute',
    left: 25,
    top: 15,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1996D3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardContainerDark: {
    backgroundColor: '#2C2C2E',
    shadowOpacity: 0.6,
  },
  circleContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#074B7C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  circleContainerDark: {
    backgroundColor: '#1565A1',
  },
  circleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
  cardTextDark: {
    color: '#E5E5EA',
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

export default SubComplaint;
