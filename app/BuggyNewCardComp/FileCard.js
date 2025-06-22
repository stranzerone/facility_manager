import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import NetInfo from "@react-native-community/netinfo";

import styles from "./styles";
import RemarkCard from "./RemarkCard";
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";
import ImageViewing from "react-native-image-viewing";
import { workOrderService } from "../../services/apis/workorderApis";
import { usePermissions } from "../GlobalVariables/PermissionsContext";
import CheckboxCardHeader from "./TopRow";

const FileCard = ({ item, onUpdate, editable }) => {
  const { nightMode } = usePermissions();
  const [capturedImage, setCapturedImage] = useState(item.result || null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const updatedTime = useConvertToSystemTime(item?.updated_at);
  const navigation = useNavigation();

  const backgroundColor = editable
    ? capturedImage
      ? nightMode ? "#254D32" : "#DFF6DD"
      : nightMode ? "#1F1F1F" : "#FFFFFF"
    : capturedImage
      ? nightMode ? "#1F3F2B" : "#DCFCE7"
      : nightMode ? "#121212" : "#E5E7EB";

  const textColor = nightMode ? "#E5E5EA" : "#1F2937";

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

  const compressAndConvertToBase64 = async (uri) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Error compressing or converting image:', error);
      Alert.alert('Error', 'Failed to process the image. Please try again.');
      return null;
    }
  };

  const handleCaptureImage = () => {
    navigation.navigate("CameraScreen", {
      onPictureTaken: async (uri) => {
        try {
          setLoading(true);
          const compressedUri = await compressImage(uri);
          const base64Image = await compressAndConvertToBase64(uri);

          if (!compressedUri || !base64Image) {
            throw new Error("Compression failed.");
          }
         const paylod = {
          id:item.id,
          result:compressedUri,
          WoUuId: item.ref_uuid,

         }

         
 const formData = new FormData()
         formData.append("name","image.jpg")
         formData.append("type","instruction")
         formData.append("file",base64Image)
     const netState = await NetInfo.fetch();
    const isConnected = netState.isConnected;


          const response = await workOrderService.addPdfToServerInstruction(uri,paylod,isConnected,true);

          if (response && response.status === "success") {
            setCapturedImage(compressedUri);
            if (onUpdate) {
              onUpdate(item.id, compressedUri);
            }
          }
        } catch (error) {
          console.error("❌ Image upload error:", error);
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
      <CheckboxCardHeader item={item} nightMode={nightMode} updatedTime={updatedTime} />

      <View className="flex-row mb-3">
        <Text className="font-bold text-md mr-2" style={{ color: textColor }}>
          {item.order}.
        </Text>
        <Text style={[styles.title, { color: textColor, flex: 1 }]} numberOfLines={2}>
          {item.title}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mb-3">
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

      <View className="mb-2">
        <RemarkCard item={item} editable={editable} />
      </View>

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
