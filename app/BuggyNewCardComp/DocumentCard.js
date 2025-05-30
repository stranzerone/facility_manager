import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  Image,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import styles from "./styles";
import RemarkCard from "./RemarkCard";
import Icon from "react-native-vector-icons/FontAwesome";
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";
import { workOrderService } from "../../services/apis/workorderApis";
import { usePermissions } from "../GlobalVariables/PermissionsContext";

const DocumentCard = ({ item, onUpdate, editable }) => {
  const { nightMode } = usePermissions();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const updatedTime = useConvertToSystemTime(item?.updated_at);

  const backgroundColor = editable
    ? item.result || selectedFile
      ? nightMode ? "#2C2C2E" : "#DFF6DD"
      : nightMode ? "#1C1C1E" : "#FFFFFF"
    : item.result || selectedFile
      ? nightMode ? "#2C2C2E" : "#DCFCE7"
      : nightMode ? "#1C1C1E" : "#E5E7EB";

  const textColor = nightMode ? "#E5E5EA" : "#1F2937";
  const iconColor = nightMode ? "#A1A1AA" : "#1F2937";

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const fileSizeInMB = (result.assets?.[0]?.size || 0) / (1024 * 1024);
        if (fileSizeInMB > 10) {
          Alert.alert("Error", "The selected file is too large. Please upload a file smaller than 10MB.");
          return;
        }

        const fileData = {
          uri: result.assets?.[0]?.uri,
          fileName: result.assets?.[0]?.name,
          mimeType: result.assets?.[0]?.mimeType,
        };

        setSelectedFile(result);
        setIsUploading(true);

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
          setUploadSuccess(true);
        }
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while selecting the document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!item.result) {
      Alert.alert("No Document", "There is no document to download.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(item.result);
      if (supported) {
        Linking.openURL(item.result);
      } else {
        Alert.alert("Error", "Unable to open the document.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while attempting to download the file.");
    }
  };

  const extractFileNameFromNewBill = (url) => {
    const fileName = decodeURIComponent(url.split("/").pop());
    const nameOfFile = fileName?.split("_")[2];
    return nameOfFile || "Unnamed PDF";
  };

  return (
    <View
      className="pb-2 rounded-md mb-3 shadow-sm"
      style={[styles.inputContainer, { backgroundColor }]}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-2 pt-2">
        <View className="flex-row items-center gap-2">
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
            style={{ width: 24, height: 24, borderRadius: 4 }}
          />
          <FontAwesome name="file-pdf-o" size={18} color={iconColor} />
          {item?.data?.optional && (
 <View className="flex-row items-center">
              
            <Icon name="info-circle" size={16} color="orange" />
            <Text className="ml-1 text-red-700 font-bold">Optional</Text>
            </View>              )}
        </View>
        <View className="flex-row gap-2 items-center">
          {updatedTime && item.result && (
            <Text className="text-xs text-gray-400">{updatedTime}</Text>
          )}
          <TouchableOpacity onPress={() => alert("Raise Complaint")}>
            <Icon name="exclamation-circle" size={18} color="red" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title */}
      <View className="flex-row p-2">
        <Text className="font-bold text-md mr-2" style={{ color: textColor }}>{item.order}.</Text>
        <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
      </View>

      {/* Actions */}
      <View className="flex-row justify-between items-center px-3 mt-1">
        <TouchableOpacity
          disabled={!editable || isUploading}
          onPress={handleUpload}
          className="flex-row items-center bg-[#1996D3] px-4 py-2 rounded-md"
        >
          <FontAwesome name="upload" size={16} color="#fff" />
          <Text className="text-white ml-2 text-sm font-medium">Upload File</Text>
        </TouchableOpacity>

        {isUploading ? (
          <ActivityIndicator size="small" color="#1996D3" />
        ) : (
          <TouchableOpacity
            onPress={handleDownload}
            className={`flex-row items-center ${
              item.result ? "bg-[#074B7C]" : "bg-gray-400"
            } px-4 py-2 rounded-md`}
            disabled={!item.result && !selectedFile}
          >
            <FontAwesome name="download" size={16} color="#fff" />
            <Text className="text-white ml-2 text-sm font-medium">
              {item.result ? "Download File" : "No File"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* File Display */}
      {item.result && (
        <View className="flex flex-row px-4 py-3 items-center mt-2 space-x-2">
          <FontAwesome name="file-pdf-o" size={16} color="#074B7C" />
          <Text className="text-gray-500 text-sm font-medium">
            {extractFileNameFromNewBill(item.result)}
          </Text>
        </View>
      )}

      {/* Remarks + Optional */}
      <View className="mt-4">
        <RemarkCard item={item} editable={editable} />

      </View>
    </View>
  );
};

export default DocumentCard;
