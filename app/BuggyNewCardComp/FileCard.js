import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import * as ImageManipulator from "expo-image-manipulator";
import styles from "./styles";
import RemarkCard from "./RemarkCard";
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";
import ImageViewing from "react-native-image-viewing";
import { workOrderService } from "../../services/apis/workorderApis";
import { usePermissions } from "../GlobalVariables/PermissionsContext";

const FileCard = ({ item, onUpdate, editable }) => {
  const { nightMode } = usePermissions();
  const [capturedImage, setCapturedImage] = useState(item.result || null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const updatedTime = useConvertToSystemTime(item?.updated_at);
  const navigation = useNavigation();

  const backgroundColor = editable
    ? capturedImage
      ? nightMode ? "#2C2C2E" : "#DFF6DD"
      : nightMode ? "#1C1C1E" : "#FFFFFF"
    : capturedImage
      ? nightMode ? "#2C2C2E" : "#DCFCE7"
      : nightMode ? "#1C1C1E" : "#E5E7EB";

  const textColor = nightMode ? "#E5E5EA" : "#1F2937";
  const iconColor = nightMode ? "#A1A1AA" : "#1F2937";

  const compressImage = async (uri) => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        {
          compress: 0.5,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return result.uri;
    } catch (error) {
      console.error("Image compression failed:", error);
      Alert.alert("Error", "Failed to compress the image.");
      return uri;
    }
  };

  const handleCaptureImage = () => {
    navigation.navigate("CameraScreen", {
      onPictureTaken: async (uri) => {
        try {
          setLoading(true);
          const compressedUri = await compressImage(uri);

          const fileData = {
            uri: compressedUri,
            fileName: `photo_${Date.now()}.jpeg`,
            mimeType: "image/jpeg",
          };

          const uploadResponse = await workOrderService.addPdfToServer(fileData, item.id, item.ref_uuid);

          if (uploadResponse) {
            const payload = {
              id: item.id,
              result: uploadResponse.data.url,
              WoUuId: item.ref_uuid,
              image: false,
            };
            await workOrderService.updateInstruction(payload);
            onUpdate();
            setCapturedImage(compressedUri);
          }
        } catch (error) {
          console.error("Image upload error:", error);
          Alert.alert("Upload Failed", "Failed to upload the image. Please try again.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <View
      className="shadow-sm rounded-lg p-3 mx-2 mb-2"
      style={[styles.inputContainer, { backgroundColor }]}
    >
      {/* Header - More compact */}
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center gap-1.5">
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
            style={{ width: 20, height: 20, borderRadius: 3 }}
          />
          <Ionicons name="image-outline" size={16} color={iconColor} />
          {item?.data?.optional && (
            <View className="flex-row items-center gap-1">
              <Icon name="info-circle" size={14} color="orange" />
              <Text className="text-orange-600 font-bold text-xs">Optional</Text>
            </View>    
          )}
        </View>
        <View className="flex-row gap-2 items-center">
          <TouchableOpacity onPress={() => alert("Raise Complaint")}>
            <Icon name="exclamation-circle" size={16} color="red" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title - More compact */}
      <View className="flex-row mb-3">
        <Text className="font-bold text-md mr-2" style={{ color: textColor }}>
          {item.order}.
        </Text>
        <Text style={[styles.title, { color: textColor, flex: 1 }]} numberOfLines={2}>
          {item.title}
        </Text>
      </View>

      {/* Image and Capture Button - More compact layout */}
      <View className="flex-row items-center justify-between mb-3">
        {/* Image View - Smaller */}
        <View className="flex-1 mr-3">
          {loading ? (
            <View className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center">
              <Text className="text-gray-500 text-xs">Loading...</Text>
            </View>
          ) : capturedImage ? (
            <TouchableOpacity disabled={!editable} onPress={() => setModalVisible(true)}>
              <Image
                source={{ uri: capturedImage }}
                className="w-20 h-20 rounded-md"
                style={styles.imageAttachmentContainer}
              />
            </TouchableOpacity>
          ) : (
            <View className="w-20 h-20 border border-dashed border-gray-300 bg-gray-50 rounded-md flex items-center justify-center">
              <Ionicons name="image-outline" size={24} color="#9CA3AF" />
              <Text className="text-gray-400 text-xs mt-1">No image</Text>
            </View>
          )}
        </View>

        {/* Capture Button - Compact */}
        <View className="flex-1">
          <TouchableOpacity
            style={styles.cameraButton}
            className="bg-blue-600 py-2 px-3 rounded-md flex-row items-center justify-center gap-1"
            onPress={handleCaptureImage}
            disabled={!editable}
          >
            <Ionicons name="camera" size={16} color="white" />
            <Text className="text-white text-sm font-medium">Capture</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Remarks */}
      <View className="mb-2">
        <RemarkCard item={item} editable={editable} />
      </View>

      {/* Footer - Only show if there's content */}
      {(capturedImage && updatedTime) && (
        <View className="border-t border-gray-200 pt-2">
          <Text className="text-gray-500 text-xs">
            Updated: {updatedTime}
          </Text>
        </View>
      )}

      {/* Fullscreen Image Viewer */}
      {modalVisible && (
        <ImageViewing
          images={[{ uri: capturedImage }]}
          imageIndex={0}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
};

export default FileCard;