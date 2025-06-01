import  { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Keyboard } from "react-native";
import styles from "./styles";
import Icon from "react-native-vector-icons/FontAwesome";
import { workOrderService } from "../../services/apis/workorderApis";
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
      remarks: remark.trim(), // Send trimmed value
      WoUuId: item.ref_uuid,
    };

    try {
      // Call the API to update the remark value
       await workOrderService.updateInstruction(payload);
    } catch (error) {
      console.error("Error updating remark:", error);
    }

    // Dismiss the keyboard
    Keyboard.dismiss(); 
  };

  return (
    <View className="ml-1 flex-grow">
      {isEditing ? (
        <TextInput
          style={[styles.inputContainer,{height:35}]}
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
          <Text className="text-xs font-bold text-gray-600 mt-2">
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
