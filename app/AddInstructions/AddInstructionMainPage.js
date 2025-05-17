import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import InfoTab from './AddInfo';

const AddInstructionsPage = ({ navigation }) => {
  const [selectedGroup, setSelectedGroup] = useState('WO List'); // Default selection for dropdown
  const [selectedTab, setSelectedTab] = useState('Info');

  const renderContent = () => {
    switch (selectedTab) {
      case 'Info':
        return <InfoTab />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Instructions</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Select Group</Text>
        <Picker
          selectedValue={selectedGroup}
          onValueChange={(itemValue) => setSelectedGroup(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="WO List" value="WO List" />
          <Picker.Item label="Create New" value="Create New" />
        </Picker>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'Info' && styles.activeTab]}
          onPress={() => setSelectedTab('Info')}
        >
          <Text style={[styles.tabText, selectedTab === 'Info' && styles.activeTabText]}>Info</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'Add Bulk' && styles.activeTab]}
          onPress={() => setSelectedTab('Add Bulk')}
        >
          <Text style={[styles.tabText, selectedTab === 'Add Bulk' && styles.activeTabText]}>Add Bulk</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false} // Remove vertical scrollbar
        showsHorizontalScrollIndicator={false} // Remove horizontal scrollbar
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    alignItems: 'center', // Center vertically
    marginBottom: 10,
    borderColor: '#074B7C',
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#f9f9f9', // Light background for the dropdown
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#074B7C',
    marginRight: 10, // Space between label and dropdown
  },
  picker: {
    flex: 1, // Make picker take remaining space
    height: 50,
    width: 30,
    borderColor: '#074B7C',
    borderWidth: 1,
    borderRadius: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tab: {
    padding: 10,
    borderRadius: 6,
    flex: 1, // Make tabs occupy equal space
    marginRight: 5, // Add margin to the right
  },
  activeTab: {
    backgroundColor: '#074B7C',
  },
  tabText: {
    color: '#074B7C',
    fontWeight: '500',
    textAlign: 'center', // Center text in the tab
  },
  activeTabText: {
    color: '#fff', // Change text color for active tab
  },
  content: {
    flex: 1, // Ensure content takes full height
  },
});

export default AddInstructionsPage;
