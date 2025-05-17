import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { UpdateWorkOrder } from "../../service/WorkOrderApis/UpdateWorkOrderApi";
import { ScrollView } from "react-native";
import { GetCategory } from "../../service/GetCategoryInfo";
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";

const formatRestrictedTime = (time) => {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  const totalHours = hours + minutes / 60;
  if (totalHours >= 48) {
    const days = Math.floor(totalHours / 24);
    return `${days} day${days > 1 ? "s" : ""} `;
  } else if (totalHours >= 24) {
    return "1 day ";
  } else if (totalHours >= 1) {
    return `${Math.floor(totalHours)} hour${Math.floor(totalHours) > 1 ? "s" : ""} `;
  } else {
    return `${minutes} minute${minutes > 1 ? "s" : ""} `;
  }
};

const RestrictionCard = ({ wo, restricted, restrictedTime, description, onUpdate }) => {
  const [delayReason, setDelayReason] = useState(wo.delay_reason || ""); // Initialize with wo.delay_reason
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);
 const [category,setCategory]  = useState('')

  const formattedTime = formatRestrictedTime(restrictedTime);
  const GetCategoryInfo = async()=>{

try{

  const response = await GetCategory()

const cat = response.data?.find((item)=>item.uuid == wo.category_uuid)
setCategory(cat?.Name)

}catch(error){
  console.error(error)
}
  }





  useEffect(()=>{
    GetCategoryInfo()

  },[])


  function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
  
    // Convert "2025-04-01 11:00:00" to a Date object
    const dateObj = new Date(dateTimeString.replace(" ", "T")); // Ensure proper format for Date parsing
  
    if (isNaN(dateObj)) return 'Invalid Date';
  
    // Extract YYYY, MM, DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(dateObj.getDate()).padStart(2, '0');
  
    // Format time as HH:MM am/pm
    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  
    return `${year}/${month}/${day} ${formattedTime}`;
  }






  const uploadDelayReason = async () => {
    if (!delayReason.trim()) {
      Alert.alert("Error", "Please enter a delay reason before submitting.");
      return;
    }

    setLoading(true);

    try {


      // Send the update request to the API
      const response = await UpdateWorkOrder(wo.uuid, delayReason);

      // Ensure the response includes the updated delay reason and handle it
      if (response && response.flag_delay_reason) {
        setDelayReason(response.flag_delay_reason); // Update state with new delay reason
      }

      // Notify the parent component to refresh or update the data
      if (onUpdate) onUpdate(); // Call the onUpdate prop function to refresh data

      setShowInput(false);
      Alert.alert("Success", "Delay reason updated successfully.");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-full max-h-[50vh] p-2 rounded-md shadow-lg border-b-2 bg-blue-50 border-blue-200">
      <View>
      <View className="flex-row items-center mb-2">
     
        <FontAwesome name="tag" size={20} color="#074B7C" />
        <Text className="ml-2 px-2 text-lg font-bold text-blue-900">{wo.Name}</Text>
     </View>
  

      </View>

      <View className="flex-row flex-wrap gap-2">
        <View className="flex-row items-center bg-blue-200 px-1 py-1 rounded-md">
          <FontAwesome name="id-badge" size={16} color="#074B7C" />
          <Text className="ml-2 font-bold text-sm text-blue-800">{wo["Sequence No"]}</Text>
        </View>

{ category && <View className="flex-row items-center bg-green-200 px-1 py-1 rounded-md">
<FontAwesome name="folder" size={16} color="#074B7C" />
<Text className="ml-2 font-bold text-sm text-green-800">
  {category?.length > 12 ? category.slice(0, 12) + "..." : category}
</Text>
</View>}


        <View className="flex-row items-center bg-yellow-100 px-1 py-1 rounded-md">
          <FontAwesome name="exclamation-circle" size={16} color="#074B7C" />
          <Text className="ml-2 font-bold text-sm text-black">{wo.Type}</Text>
        </View>

        {wo.wo_restriction_time &&(
          <View className={`flex-row items-center bg-white border-2 ${restricted?"border-red-400":"border-green-400"} px-1 py-1 rounded-md`}>
            <FontAwesome name="clock-o" size={16} color="black" />
            <Text className={`ml-2 font-black text-sm   ${restricted?"text-red-500":"text-green-500"}`} >{restricted?null:"In"} {formattedTime} {restricted?"ago":null}</Text>
          </View>
        )}
      </View>

      {restricted && (
        <View className="mt-2">
          <View className="flex flex-row gap-1 items-center justify-center">
            <FontAwesome name="stop-circle" size={20} color="red" />
            <Text className="text-red-500 font-bold text-center">Restriction Applied</Text>
          </View>

          {/* Delay Reason Section */}
          <View className="mt-2 flex-row items-center rounded-md px-4 py-4 bg-white">
            {!showInput ? (
        <View style={{ maxHeight: 60 }}>
     
          <ScrollView 
      className="px-2" 
      nestedScrollEnabled={true}  // Allow inner scroll separately
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}  // Make sure the scroll is visible
    >
      <TouchableOpacity onPress={() => setShowInput(true)} className="flex-1">
            <Text className="font-black">Delay Reason</Text>
            <Text className="text-gray-600 flex flex-row gap-2 mt-1 font-semibold">
              <FontAwesome name="pencil" size={15} style={{ color: "#3B82F6" }} />
              &nbsp;
              {delayReason || wo.flag_delay_reason || "Enter delay reason..."}
            </Text>
          </TouchableOpacity>
    </ScrollView>
      </View>
      
            ) : (
              <TextInput
                className="flex-1 text-black"
                placeholder="Enter delay reason..."
                placeholderTextColor="#888"
                value={delayReason}
                onChangeText={setDelayReason}
              />
            )}

            {showInput && (
              <TouchableOpacity
                onPress={uploadDelayReason}
                className={`ml-2 px-3 py-1 rounded-md ${loading ? "bg-gray-400" : "bg-blue-600"}`}
                disabled={loading}
              >
                <Text className="text-white font-bold">{loading ? "..." : "Submit"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

<View className="mt-2 border-t border-gray-400 pt-2">
  <View className="max-h-20 min-h-8"> 

    <ScrollView 
      className="px-2" 
      nestedScrollEnabled={true}  
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}  
    >
{ wo['Due Date'] && <View className="flex flex-row items-center justify-start mr-2 space-x-2 font-bold">
     <FontAwesome name="clock-o" size={16} color="gray" />
     <Text className="text-gray-700 font-extrabold">Due at : </Text>
          <Text className="text-gray-700 font-extrabold ml-2">
     {wo['Due Date'] 
    ? (/\d{2}:\d{2}/.test(wo['Due Date']) 
        ?formatDateTime(wo['Due Date'])
        : `${wo['Due Date']} 12:00 AM`) 
    : 'N/A'}
    </Text>
</View>}
      <Text className="text-sm text-left  font-bold text-gray-900">
        ** {description} **
      </Text>
    </ScrollView>
  </View>
</View>




    </View>
  );
};

export default RestrictionCard;
