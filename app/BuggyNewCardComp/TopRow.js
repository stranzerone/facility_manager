import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Linking } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import ImageViewing from "react-native-image-viewing";
import { usePermissions } from "../GlobalVariables/PermissionsContext";

const CheckboxCardHeader = ({
  item,
  nightMode,
  updatedTime,
  
  
}) => {
  const [modalVisible,setModalVisible]  = useState(false)
  const handleFileDownload = async () => {
    try {
      if (item?.file) {
        const supported = await Linking.canOpenURL(item.file);
        if (supported) {
          Linking.openURL(item.file);
        } else {
          alert("Cannot open file URL");
        }
      }
    } catch (err) {
      console.error("File open error:", err);
    }
  };
  const iconColor = nightMode ? "#E0E0E0" : "#1F2937";
  const dimColor = nightMode ? "#4B5563" : "gray"; // Tailwind gray-600/light

  return (
    <View className="flex-row items-center justify-between mb-2">
      {/* Left section */}
      <View className="flex-row items-center gap-2 px-2">
        {/* Image or image placeholder */}
{item.image && item.image !== "0" && item.image !== "" ? (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
              source={{ uri: item.image }}
              style={{ width: 24, height: 24, borderRadius: 4 }}
            />
          </TouchableOpacity>
        ) : (
          <Icon name="image" size={16} color="gray" />
        )}

        {/* File icon or placeholder */}
        {item.file ?
          <TouchableOpacity onPress={handleFileDownload}>
            <Icon name="file-text" size={16} color={iconColor} />
          </TouchableOpacity>
          :
             <TouchableOpacity onPress={handleFileDownload} disabled>
            <Icon name="file-text" size={16} color="gray" />
          </TouchableOpacity>
        }

        {/* Cloud icon if in cache */}
        {item.inCache && (
          <Icon name="cloud" size={18} color={nightMode ? "#E0E0E0" : "#60A5FA"} />
        )}

        {/* Optional badge */}
        {item?.data?.optional && (
          <View className="flex-row items-center">
            <Icon name="info-circle" size={14} color="orange" />
            <Text className="ml-1 text-red-700 font-bold text-xs">Optional</Text>
          </View>
        )}
      </View>

      {/* Right section */}
   <View className="flex-row items-center gap-3">
        {updatedTime && item?.result && (
          <Text className="text-xs text-gray-400">{updatedTime}</Text>
        )}
       {false && <TouchableOpacity onPress={() => alert("Raise Complaint")}>
          <Icon
            name="clipboard"
            size={18}
            color={nightMode ? "#F87171" : "#DC2626"}
          />
        </TouchableOpacity>}
      </View>

      {/* Full screen image viewer */}
      {modalVisible && item.image && (
        <ImageViewing
          images={[{ uri: item.image }]}
          imageIndex={0}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
};

export default CheckboxCardHeader;
