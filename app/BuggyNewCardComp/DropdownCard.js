import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Image, ScrollView } from "react-native";
import styles from "./styles";
import RemarkCard from "./RemarkCard";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";
import { workOrderService } from "../../services/apis/workorderApis";
import { usePermissions } from "../GlobalVariables/PermissionsContext";
import CheckboxCardHeader from "./TopRow";

const DropdownCard = ({ item, onUpdate, editable }) => {
  const { nightMode } = usePermissions();
  const [selectedValue, setSelectedValue] = useState(item.result || "");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const updatedTime = useConvertToSystemTime(item?.updated_at);

  const backgroundColor = editable
    ? selectedValue
      ? nightMode ? "#254D32" : "#DFF6DD"
      : nightMode ? "#1F1F1F" : "#FFFFFF"
    : selectedValue
      ? nightMode ? "#1F3F2B" : "#DCFCE7"
      : nightMode ? "#121212" : "#E5E7EB";

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

    setDropdownVisible(false);
  };

  const toggleDropdown = () => {
    if (editable) {
      setDropdownVisible(!dropdownVisible);
    }
  };

  return (
    <View 
      className="rounded-md mb-3 p-2 shadow-sm" 
      style={[
        styles.inputContainer, 
        { 
          backgroundColor,
          zIndex: dropdownVisible ? 9999 : 1,
          elevation: dropdownVisible ? 10 : 1
        }
      ]}
    >
      {/* Header */}
<CheckboxCardHeader
  item={item}
  nightMode={nightMode}
  updatedTime={updatedTime}
/>
      {/* Title */}
      <View className="flex-row px-2 mb-1">
        <Text className="font-bold text-base mr-2" style={{ color: textColor }}>
          {item.order}.
        </Text>
        <Text style={[styles.title, { color: textColor, fontSize: 17 }]}>
          {item.title}
        </Text>
      </View>

      {/* Dropdown Container */}
      <View className="mx-6" style={{ zIndex: dropdownVisible ? 9999 : 1 }}>
        {/* Dropdown Input */}
        <TouchableOpacity
          className="flex flex-row items-center justify-between px-3 py-2 rounded border border-gray-300"
          disabled={!editable}
          onPress={toggleDropdown}
          style={{ 
            backgroundColor: nightMode ? "#2C2C2E" : "#F9FAFB",
            borderColor: dropdownVisible ? (nightMode ? "#60A5FA" : "#3B82F6") : (nightMode ? "#374151" : "#D1D5DB"),
            borderWidth: dropdownVisible ? 2 : 1,
          }}
        >
          <View className="flex-row items-center">
            <Ionicons 
              name={selectedValue ? "checkmark-circle" : "ellipse-outline"} 
              size={16} 
              color={selectedValue ? "#10B981" : iconColor}
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: textColor, fontSize: 13 }}>
              {selectedValue || "Select an option"}
            </Text>
          </View>
          <View className="flex-row items-center">
            {!editable && (
              <Ionicons 
                name="lock-closed" 
                size={14} 
                color="#9CA3AF" 
                style={{ marginRight: 4 }}
              />
            )}
            <Icon 
              name={dropdownVisible ? "caret-up" : "caret-down"} 
              size={16} 
              color={dropdownVisible ? (nightMode ? "#60A5FA" : "#3B82F6") : iconColor} 
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Dropdown Options - Positioned absolutely outside container */}
      {dropdownVisible && (
        <View 
          className="absolute left-8 right-8 mt-1 border border-gray-300 rounded shadow-lg"
          style={{ 
            backgroundColor: nightMode ? "#2C2C2E" : "#FFFFFF",
            maxHeight: 280,
            zIndex: 10000,
            elevation: 10, // For Android shadow
            top: 120, // Adjust this value based on your card height
            borderColor: nightMode ? "#60A5FA" : "#3B82F6",
            borderWidth: 1,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          {/* Dropdown Header */}
          <View 
            className="flex-row items-center justify-between px-3 py-2 border-b"
            style={{ 
              backgroundColor: nightMode ? "#374151" : "#F8FAFC",
              borderBottomColor: nightMode ? "#4B5563" : "#E2E8F0"
            }}
          >
            <View className="flex-row items-center">
              <Ionicons name="list" size={16} color={nightMode ? "#60A5FA" : "#3B82F6"} />
              <Text style={{ 
                color: nightMode ? "#60A5FA" : "#3B82F6", 
                fontSize: 12, 
                fontWeight: "600",
                marginLeft: 6
              }}>
                Select Option
              </Text>
            </View>
            <TouchableOpacity onPress={() => setDropdownVisible(false)}>
              <Ionicons name="close" size={16} color={nightMode ? "#9CA3AF" : "#6B7280"} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={{ maxHeight: 240 }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {item?.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                className="px-3 py-3 border-b border-gray-200"
                onPress={() => handleChange(option)}
                style={{
                  backgroundColor: selectedValue === option 
                    ? (nightMode ? "#1E3A8A" : "#EBF4FF")
                    : "transparent",
                  borderBottomColor: nightMode ? "#374151" : "#E5E7EB",
                  borderBottomWidth: index === item.options.length - 1 ? 0 : 1,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Ionicons 
                      name={selectedValue === option ? "radio-button-on" : "radio-button-off"} 
                      size={16} 
                      color={selectedValue === option 
                        ? (nightMode ? "#60A5FA" : "#3B82F6")
                        : (nightMode ? "#6B7280" : "#9CA3AF")
                      }
                    />
                    <Text 
                      style={{ 
                        color: selectedValue === option 
                          ? (nightMode ? "#60A5FA" : "#1E40AF")
                          : textColor,
                        fontSize: 13,
                        fontWeight: selectedValue === option ? "600" : "400",
                        marginLeft: 8,
                        flex: 1
                      }}
                    >
                      {option}
                    </Text>
                  </View>
                  {selectedValue === option && (
                    <Ionicons 
                      name="checkmark" 
                      size={16} 
                      color={nightMode ? "#10B981" : "#059669"} 
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Dropdown Footer */}
          <View 
            className="flex-row items-center justify-center px-3 py-2 border-t"
            style={{ 
              backgroundColor: nightMode ? "#374151" : "#F8FAFC",
              borderTopColor: nightMode ? "#4B5563" : "#E2E8F0"
            }}
          >
            <Ionicons name="chevron-up" size={12} color={nightMode ? "#9CA3AF" : "#6B7280"} />
            <Text style={{ 
              color: nightMode ? "#9CA3AF" : "#6B7280", 
              fontSize: 10,
              marginLeft: 4
            }}>
              Scroll for more
            </Text>
          </View>
        </View>
      )}

      {/* Remarks */}
      <View className="mt-3">
        <RemarkCard item={item} editable={editable} />
      </View>
    </View>
  );
};

export default DropdownCard;