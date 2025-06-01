import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Image } from "react-native";
import styles from "./styles";
import OptionsModal from "../DynamivPopUps/DynamicOptionsPopUp";
import RemarkCard from "./RemarkCard";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";
import { workOrderService } from "../../services/apis/workorderApis";
import { usePermissions } from "../GlobalVariables/PermissionsContext";

const DropdownCard = ({ item, onUpdate, editable }) => {
  const { nightMode } = usePermissions();
  const [selectedValue, setSelectedValue] = useState(item.result || "");
  const [modalVisible, setModalVisible] = useState(false);
  const updatedTime = useConvertToSystemTime(item?.updated_at);

  const backgroundColor = editable
    ? selectedValue
      ? nightMode ? "#2C2C2E" : "#DFF6DD"
      : nightMode ? "#1C1C1E" : "#FFFFFF"
    : selectedValue
      ? nightMode ? "#2C2C2E" : "#DCFCE7"
      : nightMode ? "#1C1C1E" : "#E5E7EB";

  const textColor = nightMode ? "#E5E5EA" : "#1F2937";
  const iconColor = nightMode ? "#A1A1AA" : "#1F2937";

  const handleChange = async (value) => {
    setSelectedValue(value);

    try {
      const payload = {
        id: item.id,
        result: value,
        WoUuId: item.ref_uuid,
        image: false,
      };

      await workOrderService.updateInstruction(payload);
      onUpdate();
    } catch (error) {
      console.error("Error updating option:", error);
      Alert.alert("Error", "Failed to update option.");
    }

    setModalVisible(false);
  };

  return (
    <View className="rounded-md mb-3 p-2 shadow-sm" style={[styles.inputContainer, { backgroundColor }]}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-2 mb-1">
        <View className="flex-row items-center gap-2">
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
            style={{ width: 20, height: 20, borderRadius: 4 }}
          />
          <Ionicons name="document-text-outline" size={16} color={iconColor} />
          {item?.data?.optional && (
          <View className="flex-row items-center">
              
            <Icon name="info-circle" size={16} color="orange" />
            <Text className="ml-1 text-red-700 font-bold">Optional</Text>
            </View>    
                )}
        </View>
        <View className="flex-row gap-2 items-center">
          {selectedValue && updatedTime && (
            <Text className="text-[10px] text-gray-400">{updatedTime}</Text>
          )}
          <TouchableOpacity onPress={() => alert("Raise Complaint")}>
            <Icon name="exclamation-circle" size={16} color="red" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title */}
      <View className="flex-row px-2 mb-1">
        <Text className="font-bold text-base mr-2" style={{ color: textColor }}>
          {item.order}.
        </Text>
        <Text style={[styles.title, { color: textColor, fontSize: 17 }]}>
          {item.title}
        </Text>
      </View>

      {/* Dropdown */}
      <TouchableOpacity
        className="flex flex-row items-center justify-between px-3 mx-6 py-2 rounded border border-gray-300"
        disabled={!editable}
        onPress={() => setModalVisible(true)}
        style={{ backgroundColor: nightMode ? "#2C2C2E" : "#F9FAFB" }}
      >
        <Text style={{ color: textColor, fontSize: 13 }}>
          {selectedValue || "Select an option"}
        </Text>
        <Icon name="caret-down" size={16} color={iconColor} />
      </TouchableOpacity>

      {/* Modal */}
      <OptionsModal
        visible={modalVisible}
        options={item?.options?.map((option) => ({
          label: option,
          value: option,
        }))}
        onSelect={handleChange}
        onClose={() => setModalVisible(false)}
      />

      {/* Remarks */}
      <View className="mt-3">
        <RemarkCard item={item} editable={editable} />
       
      </View>
    </View>
  );
};

export default DropdownCard;
