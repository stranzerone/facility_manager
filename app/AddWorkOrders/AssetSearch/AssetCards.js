import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import GetAssets from '../../../service/AddWorkOrderApis/FetchAssests';

const AssetCard = ({ searchQuery, onClose, onSelect }) => {
  const [assets, setAssets] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssetsData = async () => {
      setStatus('loading');
      try {
        if (!searchQuery.trim()) {
          setAssets([]);
          setStatus('succeeded');
          return;
        }

        const data = await GetAssets(searchQuery);
        setAssets(data.data || []);
        setStatus('succeeded');
      } catch (error) {
        setError(error.message || 'Failed to fetch assets');
        setStatus('failed');
      }
    };

    fetchAssetsData();
  }, [searchQuery]);

  const filteredAssets = Array.isArray(assets) ? assets.filter((item) =>
    item.Name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleSelectAsset = (asset) => {
    onSelect(asset);
    onClose();
  };

  if (status === 'loading') {
    return <Text>Loading assets...</Text>;
  }

  if (status === 'failed') {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <FontAwesome name="close" size={24} color="black" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView}>
        {filteredAssets.length > 0 ? (
          filteredAssets.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.assetItem}
              onPress={() => handleSelectAsset(item)}
            >
              <Text style={styles.assetText}>{item.Name}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noAssetsText}>No assets found</Text>
        )}
      </ScrollView>
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
    width: "100%",
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
  scrollView: {
    maxHeight: '100%',  // Ensure the scroll area doesn't take up the full screen
  },
  assetItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginVertical: 5,
  },
  assetText: {
    color: '#074B7C',
    fontSize: 16,
    fontWeight: '500',
  },
  noAssetsText: {
    color: '#B0BEC5',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default AssetCard;
