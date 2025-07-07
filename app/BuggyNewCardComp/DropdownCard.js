import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  UIManager,
  findNodeHandle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { usePermissions } from "../GlobalVariables/PermissionsContext";
import { workOrderService } from "../../services/apis/workorderApis";
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";
import CheckboxCardHeader from "./TopRow";
import RemarkCard from "./RemarkCard";
import styles from "./styles";
const DropdownCard = ({ item, onUpdate, as, editable, wo }) => {
  const { nightMode } = usePermissions();
  const updatedTime = useConvertToSystemTime(item?.updated_at);
  const [selectedValue, setSelectedValue] = useState(item.result || "");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const backgroundColor = editable
    ? selectedValue
      ? nightMode ? "#254D32" : "#DFF6DD"
      : nightMode ? "#1F1F1F" : "#FFFFFF"
    : selectedValue
      ? nightMode ? "#1F3F2B" : "#DCFCE7"
      : nightMode ? "#121212" : "#E5E7EB";

  const textColor = nightMode ? "#E5E5EA" : "#1F2937";
  const borderColor = nightMode ? "#3A3A3C" : "#D1D5DB";
  const highlightColor = nightMode ? "#60A5FA" : "#3B82F6";
  const iconColor = nightMode ? "#A1A1AA" : "#1F2937";

  const handleOpenDropdown = () => {
    if (!editable) return;
    UIManager.measureInWindow(
      findNodeHandle(dropdownRef.current),
      (x, y, width, height) => {
        setDropdownPos({ top: y + height, left: x, width });
        setDropdownVisible(true);
      }
    );
  };

  const handleChange = async (value) => {
    setSelectedValue(value);
    setDropdownVisible(false);
    try {
      const payload = {
        id: item.id,
        result: value,
        WoUuId: item.ref_uuid,
      };
      await workOrderService.updateInstruction(payload);
      onUpdate();
    } catch (error) {
      console.error("Error updating option:", error);
    }
  };

  return (
     <View style={[styles.inputContainer, { backgroundColor }]} className="p-3 border border-gray-200 rounded-md mb-3 shadow-sm">

      <CheckboxCardHeader
        item={item}
        as={as}
        wo={wo}
        nightMode={nightMode}
        updatedTime={updatedTime}
      />

      <View className="flex-row px-2 mb-1">
        <Text className="font-bold text-base mr-2" style={{ color: textColor }}>
          {item.order}.
        </Text>
          <Text numberOfLines={4} style={[styles.title, { color: textColor }]}>{item.title}</Text>
      </View>

      {/* Dropdown Trigger */}
      <View className="mx-6">
        <TouchableOpacity
          ref={dropdownRef}
          onPress={handleOpenDropdown}
          disabled={!editable}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: nightMode ? "#2C2C2E" : "#F9FAFB",
            borderColor: dropdownVisible ? highlightColor : borderColor,
            borderWidth: 1,
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
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
          <Icon
            name={dropdownVisible ? "caret-up" : "caret-down"}
            size={16}
            color={iconColor}
          />
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
      <Modal visible={dropdownVisible} transparent animationType="fade">
        <Pressable style={{ flex: 1 }} onPress={() => setDropdownVisible(false)}>
          <View
            style={{
              position: "absolute",
              top: dropdownPos.top + 4,
              left: dropdownPos.left,
              width: dropdownPos.width,
              maxHeight: 280,
              backgroundColor: nightMode ? "#1C1C1E" : "#FFFFFF",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: borderColor,
              elevation: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              overflow: "hidden",
            }}
          >
            <ScrollView nestedScrollEnabled>
              {item.options?.map((option, index) => {
                const selected = selectedValue === option;
                return (
                  <TouchableOpacity
                    key={`${option}-${index}`}
                    onPress={() => handleChange(option)}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: selected
                        ? nightMode
                          ? "#2A3A5A"
                          : "#EEF6FF"
                        : "transparent",
                      borderBottomWidth:
                        index === item.options.length - 1 ? 0 : 1,
                      borderBottomColor: nightMode ? "#2E2E2E" : "#E5E7EB",
                    }}
                  >
                    <Ionicons
                      name={selected ? "radio-button-on" : "radio-button-off"}
                      size={16}
                      color={selected ? highlightColor : iconColor}
                      style={{ marginRight: 10 }}
                    />
                    <Text
                      style={{
                        color: selected ? highlightColor : textColor,
                        fontWeight: selected ? "600" : "400",
                        fontSize: 13,
                        flex: 1,
                      }}
                    >
                      {option}
                    </Text>
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={nightMode ? "#10B981" : "#059669"}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Remarks */}
      <View className="mt-3">
        <RemarkCard item={item} editable={editable} />
      </View>
    </View>
  );
};

export default DropdownCard;
