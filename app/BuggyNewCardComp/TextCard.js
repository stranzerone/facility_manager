import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import RemarkCard from "./RemarkCard";
import styles from "./styles";
import Icon from "react-native-vector-icons/FontAwesome";
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";
import { workOrderService } from "../../services/apis/workorderApis";
import { usePermissions } from "../GlobalVariables/PermissionsContext";
import CheckboxCardHeader from "./TopRow";

const TextCard = ({ item, onUpdate, editable, type }) => {
  console.log(item,'for text',editable)
  const { nightMode } = usePermissions();
  const [value, setValue] = useState(item.result || "");
  const updatedTime = useConvertToSystemTime(item?.updated_at);

  const backgroundColor = editable
    ? value
      ? nightMode ? "#254D32" : "#DFF6DD"
      : nightMode ? "#1F1F1F" : "#FFFFFF"
    : value
      ? nightMode ? "#1F3F2B" : "#DCFCE7"
      : nightMode ? "#121212" : "#E5E7EB";


  const textColor = nightMode ? "#E5E5EA" : "#1F2937";
  const inputBG = nightMode ? "#2C2C2E" : "#F9FAFB";
  const inputText = nightMode ? "#F5F5F5" : "#111827";

  const handleBlur = async () => {
    try {
      const payload = {
        id: item.id,
        result: value.trim(),
        WoUuId: item.ref_uuid,
        image: false,
      };

     const response =  await workOrderService.updateInstruction(payload);
      console.log("calling on update",response)
      onUpdate();
    } catch (error) {
      console.error("Error updating instruction:", error);
      Alert.alert("Error", "Failed to update instruction.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <View style={[styles.inputContainer, { backgroundColor }]} className="p-3 border border-gray-200 rounded-md mb-3 shadow-sm">

        {/* Header Section */}
<CheckboxCardHeader
  item={item}
  nightMode={nightMode}
  updatedTime={updatedTime}
/>
        {/* Title */}
        <View className="flex-row items-start p-2">
          <Text className="font-bold text-md mr-2" style={{ color: textColor }}>{item.order}.</Text>
          <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
        </View>

        {/* Input or Result */}
        {editable ? (
          <TextInput
            style={[styles.inputContainer, {
              backgroundColor: inputBG,
              color: inputText,
              height:35,
              padding: 8,
              borderRadius: 6,
            }]}
            value={value}
            onChangeText={setValue}
            keyboardType={type === "number" ? "numeric" : "default"}
            onBlur={handleBlur}
            placeholder={type === "number" ? "Enter Numerical Value" : "Enter your text"}
            placeholderTextColor={nightMode ? "#A1A1AA" : "#9CA3AF"}
          />
        ) : (
          <Text style={[styles.inputContainer, { color: textColor }]}>{item.result}</Text>
        )}

        {/* Remarks */}
        <RemarkCard item={item} editable={editable} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default TextCard;
