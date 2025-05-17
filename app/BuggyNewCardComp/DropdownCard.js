import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import styles from "../BuggyListCardComponets/InputFieldStyleSheet";
import OptionsModal from "../DynamivPopUps/DynamicOptionsPopUp";
import RemarkCard from "./RemarkCard"; // Assuming RemarkCard is available
import { UpdateInstructionApi } from "../../service/BuggyListApis/UpdateInstructionApi";
import Icon from "react-native-vector-icons/FontAwesome"; // Import FontAwesome
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";


const DropdownCard = ({ item, onUpdate,editable }) => {
  const [selectedValue, setSelectedValue] = useState(item.result || "");
  const [modalVisible, setModalVisible] = useState(false);
  const updatedTime =useConvertToSystemTime(item?.updated_at)

  const handleChange = async (value) => {
    setSelectedValue(value); // Update the selected value locally

    try {
      // Prepare the payload
      const payload = {
        id: item.id,
        value: value,
        WoUuId: item.ref_uuid,
        image: false,
      };

      // Call the API to update the value
 await UpdateInstructionApi(payload);

  onUpdate()

    } catch (error) {
      console.error("Error updating option:", error);
      Alert.alert("Error", "Failed to update option.");
    }

    setModalVisible(false); // Close the modal after selection
  };

  return (
    <View
      style={[
        styles.inputContainer,
    editable?selectedValue ? { backgroundColor: "#DFF6DD" } :{backgroundColor:"white"}:selectedValue?{ backgroundColor: "#DCFCE7" } : { backgroundColor: "#E5E7EB" }, // Light green if a value is selected
      ]}
    >
      {/* Title */}
      <View className="flex-row p-2">
      <Text className="font-bold  text-xl mr-2">{item.order}.</Text>
      
      <Text style={styles.title}>{item.title}</Text>

      </View>
      {/* Touchable dropdown button */}
      <View style={styles.dropdownContainer}>
       <TouchableOpacity
       className="flex flex-row items-center justify-between"
        disabled={!editable}
          style={styles.inputContainer}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.dropdownText}>
            {selectedValue || "Select an option"}
          </Text>
          
          <Icon
            name="caret-down"
            size={20}
            color="#074B7C"
            className="ml-2" // Adds space between text and icon
          />
        </TouchableOpacity>
      </View>

      {/* Modal for options */}
      <OptionsModal
        visible={modalVisible}
        options={item?.options?.map((option) => ({
          label: option,
          value: option,
        }))}
        onSelect={handleChange}
        onClose={() => setModalVisible(false)}
      />

      {/* RemarkCard placed below the dropdown */}
      <RemarkCard
        item={item}
        editable={editable}
       
      />

<View className="flex-1 bg-transparent justify-end  px-4 py-2 mt-4 h-8">

         { item.result || item?.data?.optional ? 
    <View >
      {selectedValue && updatedTime &&    <Text className="text-gray-500 text-[11px]  font-bold">
         Updated at : {updatedTime}
        </Text>}
    
                </View>:null}
                {item?.data?.optional && (
                  <View className="flex-row justify-end gap-1 items-center absolute bottom-2 right-0">
                    <Icon name="info-circle" size={16} color="red" />
                    <Text className="text-xs text-red-800 font-bold mr-2">Optional</Text>
                  </View>
                        )}
   </View>
    </View>
  );
};

export default DropdownCard;
