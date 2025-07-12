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
import CheckboxCardHeader from "./TopRow";
import NetInfo from "@react-native-community/netinfo";

const DocumentCard = ({ item, onUpdate,as, editable,wo }) => {
  const { nightMode } = usePermissions();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const updatedTime = useConvertToSystemTime(item?.updated_at);

  const backgroundColor = editable
    ? item.result
      ? nightMode ? "#254D32" : "#DFF6DD"
      : nightMode ? "#1F1F1F" : "#FFFFFF"
    : item.result
      ? nightMode ? "#1F3F2B" : "#DCFCE7"
      : nightMode ? "#121212" : "#E5E7EB";


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
  
        const formData = new FormData()
         formData.append("name",result.assets?.[0]?.name)
         formData.append("type",result.assets?.[0]?.mimeType)
         formData.append("file",result.assets?.[0]?.uri)

        const paylod = {
          id:item.id,
          result:result.assets?.[0]?.uri,
          WoUuId: item.ref_uuid,

         }
    const netState = await NetInfo.fetch();
    const isConnected = netState.isConnected;



        setSelectedFile(result);
        setIsUploading(true);
  const response = await  workOrderService.addPdfToServerInstruction(result.assets?.[0]?.uri,paylod,isConnected,true)
        // const uploadResponse = await workOrderService.addPdfToServer(fileData, item.id, item.ref_uuid);
       if (response && response.status === "success") {
             setSelectedFile(result);
            if (onUpdate) {
              onUpdate(item.id,result.assets?.[0]?.uri );
            }
          }
      }
    } catch (error) {
      console.log(error,'this is error')
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
  const fileName = decodeURIComponent(url.split("/").pop() || "");
  const match = fileName.match(/^(.*?\.pdf)/i); // match up to ".pdf"
  return match ? match[1] : fileName || "Unnamed PDF";
};



  return (
    <View
      className="pb-2 rounded-md mb-3 shadow-sm py-2"
      style={[styles.inputContainer, { backgroundColor }]}
    >
      {/* Header */}
<CheckboxCardHeader
wo={wo}
  as={as}

  item={item}
  nightMode={nightMode}
  updatedTime={updatedTime}
/>
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
