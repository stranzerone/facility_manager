import React, { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Image, Text, View, Modal, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";
import ImageViewing from "react-native-image-viewing";
import { usePermissions } from "../GlobalVariables/PermissionsContext";

export const RenderComment = ({ item }) => {
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const { nightMode } = usePermissions();

  const toggleImageModal = () => {
    setImageModalVisible(true);
  };

  return (
    <View 
      className={`flex-row p-3 border shadow-sm rounded-lg mb-1 ${
        nightMode 
          ? 'border-gray-600 bg-gray-800' 
          : 'border-blue-200 bg-white'
      }`}
    >
      <FontAwesome 
        name="comment" 
        size={18} 
        color={nightMode ? "#60A5FA" : "#1996D3"} 
        className="mr-3 mt-1" 
      />
      
      <View className="flex-1">
        {/* Staff Name */}
        <Text 
          className={`font-semibold ml-1 mb-1 ${
            nightMode ? 'text-blue-300' : 'text-blue-700'
          }`}
        >
          {item.name}
        </Text>
                
        {/* Comment */}
        <Text 
          className={nightMode ? 'text-gray-300' : 'text-gray-600'}
        >
          {item.remarks}
        </Text>

        {/* Date and Time aligned to bottom-right */}
        <Text 
          className={`text-xs font-bold mt-4 self-start pt-2 ${
            nightMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {useConvertToSystemTime(item.created_at)}
        </Text>
      </View>

      {/* Show Image Preview if img_src is available */}
      {/* Image Preview Modal */}
      {isImageModalVisible ? (
        <ImageViewing 
          images={[{ uri: item.img_src }]} 
          imageIndex={0} 
          visible={isImageModalVisible} 
          onRequestClose={() => setImageModalVisible(false)} 
        />
      ) : (
        item.img_src && (
          <TouchableOpacity onPress={toggleImageModal} className="ml-3">
            <Image
              source={{ uri: item.img_src }}
              style={{ 
                width: 70, 
                height: 70, 
                borderRadius: 10,
                opacity: nightMode ? 0.9 : 1
              }}
            />
          </TouchableOpacity>
        )
      )}
    </View>
  );
};