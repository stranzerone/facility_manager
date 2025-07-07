import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { workOrderService } from "../../services/apis/workorderApis";

const AssetSelect = () => {
  const [options, setOptions] = useState([]);

  // Fetch asset options when the component is mounted


    const fetchAssetOptions = async() => {
      try {
        const response =  await workOrderService.getQrAssets();
        if (response?.data?.length > 0) {
          const data = response.data.map((item) => ({
            id: item._ID?.toString(),
            label: item.Name,
            value: item.Name,
          }));
          setOptions(data); // Set the fetched options
        } else {
          console.log("No data received from API");
        }
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    fetchAssetOptions();

; // Empty dependency array ensures this runs only once

  // Render each option as a selectable item
 

  return (
    <View style={styles.container}>
      <ScrollView>
        {options.map((item) => (
          <TouchableOpacity
            key={item.id} // Unique key for each item
            style={styles.item}
            onPress={() => handleSelect(item)} // Handle item selection
          >
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    padding: 12,
    marginVertical: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AssetSelect;
