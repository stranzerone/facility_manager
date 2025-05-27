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

const TextCard = ({ item, onUpdate, editable, type }) => {
  const { nightMode } = usePermissions();
  const [value, setValue] = useState(item.result || "");
  const updatedTime = useConvertToSystemTime(item?.updated_at);

  const backgroundColor = editable
    ? value
      ? nightMode ? "#2C2C2E" : "#DFF6DD"
      : nightMode ? "#1C1C1E" : "#FFFFFF"
    : value
      ? nightMode ? "#2C2C2E" : "#DCFCE7"
      : nightMode ? "#1C1C1E" : "#E5E7EB";

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

      await workOrderService.updateInstruction(payload);
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
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
              style={{ width: 24, height: 24, borderRadius: 4 }}
            />
            <Icon name="file-text" size={18} color={nightMode ? "#A1A1AA" : "#1F2937"} />
            {item?.data?.optional && (
 <View className="flex-row items-center">
              
            <Icon name="info-circle" size={16} color="orange" />
            <Text className="ml-1 text-red-700 font-bold">Optional</Text>
            </View>                )}
          </View>

          <View className="flex-row items-center gap-3">
            {value && updatedTime && (
              <Text className="text-xs text-gray-400">{updatedTime}</Text>
            )}
            <TouchableOpacity onPress={() => alert('Raise Complaint')}>
              <Icon name="exclamation-circle" size={18} color="red" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <View className="flex-row items-start p-2">
          <Text className="font-bold text-lg mr-2" style={{ color: textColor }}>{item.order}.</Text>
          <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
        </View>

        {/* Input or Result */}
        {editable ? (
          <TextInput
            style={[styles.inputContainer, {
              backgroundColor: inputBG,
              color: inputText,
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
