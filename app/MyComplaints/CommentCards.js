import React, { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Image, Text, View, Modal, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";
import ImageViewing from "react-native-image-viewing";

export const RenderComment = ({ item }) => {
  const [isImageModalVisible, setImageModalVisible] = useState(false);

  const toggleImageModal = () => {
    setImageModalVisible(true);
  };

  return (
    <View className="flex-row p-4 border border-blue-200 bg-white shadow-sm rounded-lg mb-3">
      <FontAwesome name="comment" size={18} color="#1996D3" className="mr-3 mt-1" />

      <View className="flex-1">
        {/* Staff Name */}
        <Text className="text-blue-700 font-semibold ml-1 mb-1">{item.name}</Text>
        
        {/* Comment */}
        <Text className="text-gray-600">{item.remarks}</Text>

        {/* Date and Time aligned to bottom-right */}
        <Text className="text-xs text-gray-500 font-bold mt-4 self-start pt-2">
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
      )
    :(
      item.img_src && (
        <TouchableOpacity onPress={toggleImageModal} className="ml-3">
          <Image
            source={{ uri: item.img_src }}
            style={{ width: 70, height: 70, borderRadius: 10 }}
          />
        </TouchableOpacity>
      

    )
    )
    
    }
    </View>
  );
};
