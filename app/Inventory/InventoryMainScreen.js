import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { InventoryServices } from "../../services/apis/InventoryApi";

const options = [
  { id: "IR", label: "Issue Request", icon: "exchange", enabled: true, color: "#1996D3" },
  { id: "IO", label: "Issue Order", icon: "truck", enabled: false, color: "#F97316" },
  { id: "PO", label: "Purchase Order", icon: "shopping-cart", enabled: false, color: "#22C55E" },
  { id: "PR", label: "Purchase Request", icon: "file-text", enabled: false, color: "#E11D48" },
];


const InventoryOptionsScreen = ({route}) => {
  const uuid = route?.params?.uuid  || null;
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const cardSize = isTablet ? "30%" : "47%";
  const [invInfo,setInvInfo] = useState(null)
 

useEffect(()=>{

  const fetchData = async () => {
  try{

const response = await InventoryServices.getWareHouseStatus()

 setInvInfo(response?.data?.find((item)=>item.uuid === uuid) || {})
  }catch{
console.error(error.message || error,'error while retrieving warehouse info')
  }
  }

  fetchData()
},[])


  const navigation = useNavigation();




  return (
    <ScrollView className="flex-1 bg-white px-4 pt-6">
    <View className="mb-6 bg-[#F1F5F9] p-4 rounded-xl shadow-sm border border-gray-200">
    <View className="flex-row items-center mb-2">
  <FontAwesome name="building-o" size={20} color="#074B7C" className="mr-2" />
  <Text className="text-xl font-bold ml-2 text-[#074B7C]">
    {invInfo?.Name || "Inventory"}
  </Text>
</View>

  {invInfo?.Description ? (
 <View className="max-h-20 overflow-hidden">
 <ScrollView>
   <Text
     className="text-gray-600 text-sm"
   >
     {invInfo.Description}
   </Text>
 </ScrollView>
</View>

  ) :   
   <Text className="text--600 text-sm mt-1">
 No Description Available
</Text>
  }
</View>


      <View className="flex-row flex-wrap justify-between">
        {options.map((option) => (
          <Pressable
  key={option.id}
  android_ripple={{ color: `${option.color}20`, borderless: false }}
  onPress={() => navigation.navigate("IssuedRequests",{uuid:uuid})}
  disabled={!option.enabled}
  style={{
    width: cardSize,
    marginBottom: 16,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "gray",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
    opacity: option.enabled ? 1 : 0.4,
    elevation: Platform.OS === "android" ? 2 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  }}
>
  <FontAwesome name={option.icon} size={32} color={option.color} />
  <Text  className="text-2xl font-black mt-2 text-black">
    {option.id}
  </Text>
  <Text  className="text-sm text-black font-bold mt-1">
    {option.label}
  </Text>
</Pressable>
        ))}
      </View>

     

    </ScrollView>
  );
};

export default InventoryOptionsScreen;
