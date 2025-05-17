import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Animated, TouchableWithoutFeedback, ScrollView } from 'react-native';
import AssetCard from './AssetCards'; // Ensure correct import path
import { SafeAreaView } from 'react-native-safe-area-context';

const AssetSearch = ({ onSelectAsset }) => {
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [showAssetCard, setShowAssetCard] = useState(false); // State to control visibility of AssetCard
  const [assetHeight, setAssetHeight] = useState(new Animated.Value(0)); // Animated height for the asset container

  // Function to handle the selection of an asset
  const handleSelectAsset = (assetName) => {
    onSelectAsset(assetName)
    setSearchQuery(assetName.Name); // Set the search input to the selected asset's name
    setShowAssetCard(false); // Close the AssetCard
    collapseAssetCard(); // Collapse the asset card after selection
  };

  const changeText = (text) => {
    setSearchQuery(text); // Update search query
    setShowAssetCard(true); // Show AssetCard when typing
    expandAssetCard(); // Expand the asset card when typing
  };

  // Function to expand the asset card
  const expandAssetCard = () => {
    Animated.timing(assetHeight, {
      toValue: 400, // Set the height for displaying the AssetCard
      duration: 300,
      useNativeDriver: false, // Height animation doesn't support native driver
    }).start();
  };

  // Function to collapse the asset card
  const collapseAssetCard = () => {
    Animated.timing(assetHeight, {
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
      <SafeAreaView  style={styles.innerContainer}>
        <Text style={styles.title}>Select Asset</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Asset"
          value={searchQuery} // Display the selected asset or search query
          onChangeText={changeText} // Update search query
          onFocus={() => setShowAssetCard(true)} // Show AssetCard when focused
        />
        <Animated.View style={[styles.assetContainer, { height: assetHeight }]}>
          {showAssetCard && ( // Show AssetCard if it's visible
            <TouchableWithoutFeedback onPress={() => setShowAssetCard(true)}>
              <ScrollView style={styles.scrollView}>
                <AssetCard 
                  searchQuery={searchQuery} 
                  onClose={collapseAssetCard} // Collapse AssetCard
                  onSelect={handleSelectAsset} // Pass the handleSelectAsset function
                />
              </ScrollView>
            </TouchableWithoutFeedback>
          )}
        </Animated.View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  searchInput: {
    width: '100%',
    height: 50,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1996D3',
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  assetContainer: {
    overflow: 'hidden', // Hide overflow for smooth animation
  },
  scrollView: {
    // Optionally adjust the scroll view styling here
    paddingBottom: 10,
  },
});

export default AssetSearch;
