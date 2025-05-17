import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import RemarkCard from "./RemarkCard"; // Import RemarkCard component
import styles from "../BuggyListCardComponets/InputFieldStyleSheet";
import { UpdateInstructionApi } from "../../service/BuggyListApis/UpdateInstructionApi";
import Icon from 'react-native-vector-icons/FontAwesome';
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";

const CheckboxCard = ({ title, item, onUpdate, editable }) => {

  // Set the initial checkbox state based on item.result
  const [isChecked, setIsChecked] = useState(item.result === "1");
const updatedTime =useConvertToSystemTime(item?.updated_at)
  // Directly determine background color based on the checkbox state
  // const backgroundColor = isChecked ? "#DFF6DD" :editable? "#FFFFFF": isChecked? "#F5FFFA":"#F3F4F6"; // Light green when checked, white when unchecked
  const backgroundColor = editable?isChecked?    "#DFF6DD" : "#FFFFFF" : isChecked? "#DCFCE7":"#E5E7EB";  
  const handleCheckboxPress = async () => {
    const newState = !isChecked;
    setIsChecked(newState);

    // Prepare payload
    const payload = {
      id: item.id,
      value: newState ? "1" : "0", // Send '1' if checked, '0' if unchecked
      WoUuId: item.ref_uuid,
      image: false,
    };

    try {
      await UpdateInstructionApi(payload); // Call API to update state
      onUpdate();
    } catch (error) {
      console.error("Error updating instruction:", error);
    }
  };

  const handleTitlePress = () => {
    handleCheckboxPress(); // Trigger the same action as clicking the checkbox
  };

  return (
    <View
      style={[styles.inputContainer, { backgroundColor }]} // Apply the background color immediately
      className="p-5 border border-gray-200 rounded-lg mb-4 bg-white shadow-md"
    >
      {/* Checkbox and title container */}
      <View className="flex-row items-center justify-center mb-5">
        {/* Circular Checkbox */}
        <Text className="font-bold  text-xl mr-2">{item.order}.</Text>
        <CircularCheckbox editable={editable} isChecked={isChecked} onPress={handleCheckboxPress} />

        {/* Title */}
        <TouchableOpacity disabled={!editable} onPress={handleTitlePress} className="ml-4 flex-1">
          <Text
            style={[styles.title, { flexWrap: 'wrap', overflow: 'hidden' }]} // Make sure text wraps
            numberOfLines={0} // Allow multiple lines
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      </View>

      <RemarkCard item={item} editable={editable} />

<View className="flex-1  justify-end bg-transparent px-4 py-2 mt-4 h-8">
      { item.result || item?.data?.optional ?  
    <View >
{updatedTime &&  item?.result && <Text className="text-gray-500 text-[11px]  font-bold">
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

const CircularCheckbox = ({ isChecked, onPress, editable }) => {
  return (
    <TouchableOpacity disabled={!editable} onPress={onPress} className="flex items-center justify-center">
      <View
        className={`w-7 h-7 rounded-full border-2 ${isChecked ? "border-[#074B7C]" : "border-[#1996D3]"} flex items-center justify-center`}
      >
        {isChecked && <View className="w-4 h-4 rounded-full bg-[#074B7C]" />}
      </View>
    </TouchableOpacity>
  );
};

export default CheckboxCard;
