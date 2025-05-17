import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Linking, ActivityIndicator } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import styles from "../BuggyListCardComponets/InputFieldStyleSheet";
import { uplodPdfToServer } from "../../service/ImageUploads/ConvertPdfToUrl";
import RemarkCard from "./RemarkCard";
import Icon from 'react-native-vector-icons/FontAwesome';
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";
import { uploadImageToServer } from "../../service/ImageUploads/ConvertImageToUrlApi";

const DocumentCard = ({ item, onUpdate, editable }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const updatedTime =useConvertToSystemTime(item?.updated_at)

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

        const uploadResponse = await uploadImageToServer(fileData, item.id, item.ref_uuid);
        if (uploadResponse) {
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
    const fileName = decodeURIComponent(url.split('/').pop());
    const nameOfFile = fileName.split('_')[2];
    return nameOfFile || "No name for PDF";
  };

  return (
    <View
    className="pb-2"
      style={[
        styles.inputContainer,
     editable? item.result || selectedFile ? { backgroundColor: "#DFF6DD" } : { backgroundColor: "white" } : item.result || selectedFile ? { backgroundColor: "#DCFCE7" } : { backgroundColor: "#E5E7EB" }
      ]}
    >
      <View className="flex-row p-2">
      <Text className="font-bold  text-xl mr-2">{item.order}.</Text>
      
      <Text style={styles.title}>{item.title}</Text>

      </View>

      <View className="flex-row justify-between items-center">
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

      {item.result && (
        <View className="flex flex-row px-4 py-3 items-center mt-2 space-x-2">
          <FontAwesome name="file-pdf-o" size={16} color="#074B7C" />
          <Text className="text-gray-500 text-sm font-medium">
            {extractFileNameFromNewBill(item.result)}
          </Text>
        </View>
      )}



      <View className="mt-4">
        <RemarkCard item={item} editable={editable} />
        <View className="flex-1 bg-transparent justify-end  px-4 py-2 mt-4 h-8 ">

   { item.result || item?.data?.optional? 
     <View >
{item.result && updatedTime &&   <Text className="text-gray-500 text-[11px]  font-bold">
   Updated at : {updatedTime}
  </Text>}

          </View>:null}
          {item?.data?.optional && (
            <View className="flex-row justify-end gap-1 items-center absolute bottom-2 right-0">
              <Icon name="info-circle" size={16} color="red" />
              <Text className="text-xs text-red-800 font-bold mr-2">Optional</Text>
            </View>
                  )}
</View>
      </View>



    </View>
  );
};

export default DocumentCard;
