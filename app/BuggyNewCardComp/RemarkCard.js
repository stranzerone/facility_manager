import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Keyboard } from "react-native";
import styles from "../BuggyListCardComponets/InputFieldStyleSheet";
import { UpdateInstructionApi } from "../../service/BuggyListApis/UpdateInstructionApi";
import Icon from "react-native-vector-icons/FontAwesome";
const RemarkCard = ({ item,editable }) => {
  // Initialize the remark state based on item.remark, if exists
  const [isEditing, setIsEditing] = useState(false);
  const [remark, setRemark] = useState(item.remarks || ""); // Default to empty string if no remark

  // Handle click on title to activate the input
  const handleTitleClick = () => {
    setIsEditing(true); // Activate the input field
  };

  // Handle text input change
  const handleRemarkChange = (text) => {
    setRemark(text);
  };

  // Handle blur event to stop editing and save the remark
  const handleBlur = async () => {
    setIsEditing(false); // Close the input field

    const payload = {
      id: item.id,
      remark: remark.trim(), // Send trimmed value
      WoUuId: item.ref_uuid,
      image: false,
    };

    try {
      // Call the API to update the remark value
      const response = await UpdateInstructionApi(payload);
    } catch (error) {
      console.error("Error updating remark:", error);
    }

    // Dismiss the keyboard
    Keyboard.dismiss(); 
  };

  return (
    <View className="ml-4 flex-grow">
      {isEditing ? (
        <TextInput
          style={styles.inputContainer}
          value={remark}
          onChangeText={handleRemarkChange}
          placeholder="Enter remark upto 250 char"
          className="border border-gray-300 rounded p-2 mt-2"
          autoFocus
          onBlur={handleBlur} // Close editing, save, and dismiss keyboard when focus is lost
          onEndEditing={handleBlur} // Optional: Ensure API is called when editing ends
        />
      ) : (
        <TouchableOpacity
        disabled={!editable}
        onPress={handleTitleClick}>
          <Text className="text-sm font-bold text-gray-600 mt-2">
          <Icon name="pencil" size={16} color="#074B7C" /> 
          {'  '}
           Remark: {remark || "Click to add remark"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RemarkCard;
