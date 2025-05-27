import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
import { workOrderService } from "../../../services/apis/workorderApis";
const FileInputComponent = ({ setAttachments, attachments, setNote, note,setLoading }) => {
  const [uploading, setUploading] = useState(false);
 const [selectedFile,setSelectedFile] = useState()
  // Handle file selection
const handleFilePick = async () => {

  try {
if (attachments.length >= 10) {
  Alert.alert("Limit Reached", "You can only upload up to 5 files.");
  return;
}
    setUploading(true);
    setLoading(true);

    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'], // only allow PDF and images
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const file = result.assets[0];
      const fileSizeInMB = (file.size || 0) / (1024 * 1024);

      // Allow only PDF and image files
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimeType)) {
        Alert.alert("Unsupported File", "Only PDF and image files are allowed.");
        return;
      }

      if (fileSizeInMB > 10) {
        Alert.alert("File Too Large", "Please select a file smaller than 10MB.");
        return;
      }

      const fileData = {
        uri: file.uri,
        fileName: file.name,
        mimeType: file.mimeType,
      };

      setSelectedFile(file);

      const uploadResponse = await workOrderService.addPdfToServer(fileData, null, null, true);
      if (uploadResponse) {
        setAttachments([...attachments, uploadResponse.data.url]);
      }
    }

  } catch (error) {
    console.error("Error picking file:", error);
    Alert.alert("Error", "An error occurred while picking the file.");
  } finally {
    setUploading(false);
    setLoading(false);
  }
};

  // Remove attachment
  const removeAttachment = (id) => {
    setAttachments(attachments.filter((file) => file.id !== id));
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes("image")) return "file-image-o";
    if (fileType?.includes("pdf")) return "file-pdf-o";
    if (fileType?.includes("word") || fileType?.includes("document"))
      return "file-word-o";
    return "file-o";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  return (
    <View
      className="bg-white relative rounded-xl p-3 mb-3"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation:3,
      }}
    >
      {/* First Row: Notes Input and Buttons */}
      <View className="flex-row items-center mb-2">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <Icon name="sticky-note-o" size={14} color="#1996D3" />
            <Text className="font-semibold text-gray-800 text-sm ml-1">Notes</Text>
          </View>
          <TextInput
            className="border border-gray-300 rounded-lg p-2 h-10 text-gray-800 text-sm"
            placeholder="Add notes..."
            value={note}
            onChangeText={setNote}
            multiline
            textAlignVertical="top"
          />
        </View>
        <View className="flex-row">
          <TouchableOpacity
            className="bg-[#E1F5FE] p-2 mt-6 rounded-lg "
            onPress={handleFilePick}
            disabled={uploading}
          >
            <Icon name="file" size= {14} color="#1996D3" />
          </TouchableOpacity>
        
        </View>
      </View>

      {/* Second Row: Attachments */}
      <View>
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center">
            <Icon name="paperclip" size={14} color="#1996D3" />
            <Text className="font-semibold text-gray-800 text-sm ml-1">
              Attachments ({attachments.length})
            </Text>
          </View>
          {uploading && <ActivityIndicator size="small" color="#1996D3" />}
        </View>

        {attachments.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 4 }}
          >
            {attachments?.map((file) => (
              <View
                key={file}
                className="mr-2 bg-gray-50 rounded-lg p-1 border border-gray-200"
                style={{ width: 80 }}
              >
                {file.type?.includes("image") ? (
                  <Image
                    source={{ uri: file.uri }}
                    className="w-full h-10 rounded"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-10 bg-gray-100 rounded items-center justify-center">
                    <Icon name={getFileIcon(file.type)} size={16} color="#666" />
                  </View>
                )}
                <Text
                  className="text-xs text-gray-800 mt-1 font-medium"
                  numberOfLines={1}
                >
                  {file.name || "File"}
                </Text>
                <TouchableOpacity
                  className="absolute top-0 right-0 bg-white rounded-full p-1"
                  onPress={() => removeAttachment(file.id)}
                >
                  <Icon name="times" size={10} color="#FF4D4F" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        <View className="flex-row items-center mt-1">
          <MaterialIcons name="info-outline" size={12} color="#666" />
          <Text className="text-xs text-gray-500 ml-1">
            Images, PDF, Docs (max 10MB)
          </Text>
        </View>
      </View>
    </View>
  );
};

export default FileInputComponent;