import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QrScanner from "./QrScannerComp";
import fetchQrAssets from "../../service/AddWorkOrderApis/FetchAssetsforQr"; 
import { useNavigation } from "@react-navigation/native";
import { usePermissions } from "../GlobalVariables/PermissionsContext";
export default function MainScannerPage({route}) {
  const [scanned, setScanned] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false); // Controls visibility of options
 const [hasPermission,setPermission]  = useState(false)
  const {ppmAsstPermissions}  = usePermissions()
  const navigation = useNavigation();







  useEffect(() => {


    if(  ppmAsstPermissions && ppmAsstPermissions.some(permission => permission.includes('R'))){
      setPermission(true)
    }
    
    const fetchAssetOptions = async () => {
      try {
        setLoading(true);
        const response = await fetchQrAssets();
        const data = Array.isArray(response?.data)
          ? response.data.map((item, index) => ({
              id: item._ID || index.toString(),
              label: item.Name || "Unnamed Asset",
              value: item.Name || "Unnamed Asset",
              uuid: item.uuid || "",
            }))
          : [];

        setOptions(data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setLoading(false);
      }
    };

 
      fetchAssetOptions();

  }, []);

  const handleAssetSelect = (item) => {
    setShowOptions(false); // Hide list after selection
    navigation.navigate("MyWorkOrders", { qrValue: item.uuid, wotype: "AS" });
  };

  return (
    <View style={styles.container}>
  
  

  <View className="h-[10%]">
    {hasPermission &&  <TouchableOpacity
      className="bg-[#074B7C] font-black"
        style={styles.assetButton}
        onPress={() => setShowOptions(!showOptions)}
      >
        <Text className="text-white font-bold">Select Asset</Text>
        {!showOptions?
                <Ionicons    name="chevron-forward" size={20} color="white" />
:
<Ionicons    name="chevron-down" size={20} color="white" />

      }
      </TouchableOpacity>}

</View>





      {loading  && hasPermission ? (
        <ActivityIndicator size="large" color="#074B7C" style={styles.loadingIndicator} />
      ) : showOptions ? (
        <View className="bg-white rounded-lg shadow-md p-1 mt-1">
        <FlatList
          data={options}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
            className = "flex-row items-center gap-2 p-3 mb-2 border-b-2 bg-white rounded-lg shadow-md hover:shadow-lg"
            onPress={() => handleAssetSelect(item)}
          >
<Ionicons name="cube" className="mt-4" size={15} color="#074B7C" />

            <Text className ="text-lg  text-gray-600 font-medium flex-1">
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#074B7C" />
          </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.noDataText}>No assets found</Text>}
        />

        </View>
      ) : null}


     
     <View>

<View>
<View className='mt-10 flex flex-col items-center justify-center' style={styles.cameraContainer}>
        <QrScanner screenType={route?.params?.screenType || "OW"}  />
   </View>


  
     </View>
     <View className=' flex flex-col items-center justify-center'>
     <Ionicons name="qr-code-outline" size={100} color="#074B7C" />

     <Text className='mt-24' style={styles.instructions}>Scan QR code or select asset from above</Text>
    </View>
     </View>
     <View>

     </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#EAF2F8",
  },
  assetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    color:'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#074B7C",
    marginTop: 0,
  },
  assetText: {
    fontSize: 16,
    color: "#333",
  },
  scanIconContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#074B7C",
    padding: 10,
  },
  instructions: {
    fontSize: 18,
    color: "#074B7C",
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 20,
  },
  // cameraContainer: {
  //   flex: 1,
  //   width: "100%",
  //   maxHeight: 200,
  //   borderRadius: 20,
  //   borderWidth: 4,
  //   borderColor: "#074B7C",
  //   backgroundColor: "#fff",
  //   marginTop: 10,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  loadingIndicator: {
    padding: 20,
  },
});
