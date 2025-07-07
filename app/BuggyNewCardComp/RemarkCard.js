import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Keyboard } from "react-native";
import styles from "./styles";
import Icon from "react-native-vector-icons/FontAwesome";
import { workOrderService } from "../../services/apis/workorderApis";
import { usePermissions } from "../GlobalVariables/PermissionsContext";

const RemarkCard = ({ item, editable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [remark, setRemark] = useState(item.remarks || "");
  const inputRef = useRef(null); // ref to TextInput
  const { nightMode } = usePermissions();

  const handleTitleClick = () => {
    setIsEditing(true);

    // Delay focus to allow TextInput to render first
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleRemarkChange = (text) => {
    setRemark(text);
  };

  const handleBlur = async () => {
    setIsEditing(false);

    const payload = {
      id: item.id,
      remarks: remark.trim(),
      WoUuId: item.ref_uuid,
    };

    try {
      await workOrderService.updateInstruction(payload);
    } catch (error) {
      console.error("Error updating remark:", error);
    }

    Keyboard.dismiss();
  };

  return (
    <View className="ml-1 flex-grow">
      {isEditing ? (
        <TextInput
          ref={inputRef}
          style={[styles.inputContainer, { height: 35 }]}
          value={remark}
          onChangeText={handleRemarkChange}
          placeholder="Enter remark up to 250 char"
          className="border border-gray-300 rounded p-2 mt-2"
          onBlur={handleBlur}
          onEndEditing={handleBlur}
        />
      ) : (
        <TouchableOpacity disabled={!editable} onPress={handleTitleClick}>
          <Text className={`text-xs font-bold mt-2`} style={{ color: nightMode ? "white" : "#074B7C" }}>
            <Icon name="pencil" size={16} />{"  "}
            Remark: {remark || "Click to add remark"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RemarkCard;
