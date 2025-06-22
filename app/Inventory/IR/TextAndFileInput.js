import React, { useState, useCallback, useMemo } from "react";
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

// Dynamic styles based on night mode
const getStyles = (nightMode) => ({
  container: nightMode 
    ? "bg-gray-800 relative rounded-xl p-3 mb-3"
    : "bg-white relative rounded-xl p-3 mb-3",
  sectionTitle: nightMode 
    ? "font-semibold text-gray-100 text-sm ml-1"
    : "font-semibold text-gray-800 text-sm ml-1",
  textInput: nightMode
    ? "border border-gray-600 bg-gray-700 rounded-lg p-2 h-10 text-gray-100 text-sm"
    : "border border-gray-300 rounded-lg p-2 h-10 text-gray-800 text-sm",
  fileButton: nightMode
    ? "bg-gray-700 p-2 mt-6 rounded-lg"
    : "bg-[#E1F5FE] p-2 mt-6 rounded-lg",
  attachmentCard: nightMode
    ? "mr-2 bg-gray-700 rounded-lg p-1 border border-gray-600"
    : "mr-2 bg-gray-50 rounded-lg p-1 border border-gray-200",
  fileIconContainer: nightMode
    ? "w-full h-10 bg-gray-600 rounded items-center justify-center"
    : "w-full h-10 bg-gray-100 rounded items-center justify-center",
  fileName: nightMode
    ? "text-xs text-gray-200 mt-1 font-medium"
    : "text-xs text-gray-800 mt-1 font-medium",
  removeButton: nightMode
    ? "absolute top-0 right-0 bg-gray-800 rounded-full p-1"
    : "absolute top-0 right-0 bg-white rounded-full p-1",
  infoText: nightMode
    ? "text-xs text-gray-400 ml-1"
    : "text-xs text-gray-500 ml-1",
});

const FileInputComponent = ({ 
  setAttachments, 
  attachments, 
  setNote, 
  note, 
  setLoading,
  nightMode = false,
  disabled = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Get styles based on night mode
  const styles = useMemo(() => getStyles(nightMode), [nightMode]);
  
  // Memoized constants
  const allowedTypes = useMemo(() => [
    'application/pdf', 
    'image/jpeg', 
    'image/png', 
    'image/jpg', 
    'image/gif', 
    'image/webp'
  ], []);
  
  const maxFileSize = 10; // MB
  const maxFiles = 10;

  // Handle file selection with proper error handling
  const handleFilePick = useCallback(async () => {
    if (disabled || uploading) return;

    try {
      // Check file limit
      if (attachments.length >= maxFiles) {
        Alert.alert(
          "Limit Reached", 
          `You can only upload up to ${maxFiles} files.`
        );
        return;
      }

      setUploading(true);
      setLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false, // Ensure single file selection
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const file = result.assets[0];
      const fileSizeInMB = (file.size || 0) / (1024 * 1024);

      // Validate file type
      if (!allowedTypes.includes(file.mimeType)) {
        Alert.alert(
          "Unsupported File", 
          "Only PDF and image files are allowed."
        );
        return;
      }

      // Validate file size
      if (fileSizeInMB > maxFileSize) {
        Alert.alert(
          "File Too Large", 
          `Please select a file smaller than ${maxFileSize}MB.`
        );
        return;
      }

      const fileData = {
        uri: file.uri,
        fileName: file.name,
        mimeType: file.mimeType,
        size: file.size,
      };

      setSelectedFile(file);

      // Upload file
      const uploadResponse = await workOrderService.addPdfToServer(
        fileData, 
        null, 
        null, 
        true
      );
      if (uploadResponse?.data?.url) {
        setAttachments([...attachments, uploadResponse.data.url]);
      } else {
        throw new Error("Upload failed - no URL returned");
      }

    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert(
        "Upload Error", 
        error.message || "An error occurred while uploading the file."
      );
    } finally {
      setUploading(false);
      setLoading(false);
      setSelectedFile(null);
    }
  }, [
    disabled, 
    uploading, 
    attachments.length, 
    maxFiles, 
    allowedTypes, 
    maxFileSize, 
    setAttachments, 
    setLoading
  ]);

  // Remove attachment with confirmation
  const removeAttachment = useCallback((attachmentId) => {
    Alert.alert(
      "Remove File",
      "Are you sure you want to remove this file?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setAttachments(prev => prev.filter(file => file.id !== attachmentId));
          },
        },
      ]
    );
  }, [setAttachments]);

  // Get appropriate icon for file type
  const getFileIcon = useCallback((fileType) => {
    if (!fileType) return "file-o";
    
    const type = fileType.toLowerCase();
    if (type.includes("image")) return "file-image-o";
    if (type.includes("pdf")) return "file-pdf-o";
    if (type.includes("word") || type.includes("document")) return "file-word-o";
    if (type.includes("excel") || type.includes("spreadsheet")) return "file-excel-o";
    
    return "file-o";
  }, []);

  // Format file size for display
  const formatFileSize = useCallback((bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }, []);

  // Render attachment item
  const renderAttachment = useCallback((file, index) => {
    const isImage = file.type?.includes("image");
    return (
      <View
        key={file.id || index}
        className={styles.attachmentCard}
        style={{ width: 80, minHeight: 60 }}
      >
        {isImage && file.uri ? (
          <Image
            source={{ uri: file.uri }}
            className="w-full h-10 rounded"
            resizeMode="cover"
            onError={() => console.warn("Failed to load image:", file.uri)}
          />
        ) : (
          <View className={styles.fileIconContainer}>
            <Icon 
              name={getFileIcon(file.type)} 
              size={16} 
              color={nightMode ? "#9CA3AF" : "#666"} 
            />
          </View>
        )}
        
        <Text
          className={styles.fileName}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {file.name || "File"}
        </Text>
        
        {file.size && (
          <Text
            className={nightMode ? "text-xs text-gray-400" : "text-xs text-gray-500"}
            numberOfLines={1}
          >
            {formatFileSize(file.size)}
          </Text>
        )}
        
        <TouchableOpacity
          className={styles.removeButton}
          onPress={() => removeAttachment(file.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Icon name="times" size={10} color="#FF4D4F" />
        </TouchableOpacity>
      </View>
    );
  }, [styles, nightMode, getFileIcon, formatFileSize, removeAttachment]);

  return (
    <View
      className={styles.container}
      style={{
        shadowColor: nightMode ? "#000" : "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: nightMode ? 0.3 : 0.05,
        shadowRadius: 3,
        elevation: 3,
      }}
    >
      {/* Notes Input and File Upload Button */}
      <View className="flex-row items-center mb-2">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <Icon 
              name="sticky-note-o" 
              size={14} 
              color="#1996D3" 
            />
            <Text className={styles.sectionTitle}>Notes</Text>
          </View>
          <TextInput
            className={styles.textInput}
            placeholder="Add notes..."
            placeholderTextColor={nightMode ? "#9CA3AF" : "#9CA3AF"}
            value={note}
            onChangeText={setNote}
            multiline
            textAlignVertical="top"
            editable={!disabled}
            maxLength={500}
          />
        </View>
        
        <View className="flex-row">
          <TouchableOpacity
            className={styles.fileButton}
            onPress={handleFilePick}
            disabled={uploading || disabled}
            activeOpacity={0.7}
            style={{ 
              opacity: (uploading || disabled) ? 0.5 : 1 
            }}
          >
            {uploading ? (
              <ActivityIndicator size={14} color="#1996D3" />
            ) : (
              <Icon name="file" size={14} color="#1996D3" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Attachments Section */}
      <View>
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center">
            <Icon 
              name="paperclip" 
              size={14} 
              color="#1996D3" 
            />
            <Text className={styles.sectionTitle}>
              Attachments ({attachments.length}/{maxFiles})
            </Text>
          </View>
          {uploading && (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#1996D3" />
              <Text className={nightMode ? "text-xs text-gray-300 ml-1" : "text-xs text-gray-600 ml-1"}>
                Uploading...
              </Text>
            </View>
          )}
        </View>

        {attachments.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 4 }}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
            style={{ maxHeight: 100 }}
          >
            {attachments.map(renderAttachment)}
          </ScrollView>
        )}

        {/* Info Text */}
        <View className="flex-row items-center mt-1">
          <MaterialIcons 
            name="info-outline" 
            size={12} 
            color={nightMode ? "#9CA3AF" : "#666"} 
          />
          <Text className={styles.infoText}>
            Images, PDF, Docs (max {maxFileSize}MB each, {maxFiles} files total)
          </Text>
        </View>
        
        {/* Upload Progress or Status */}
        {selectedFile && uploading && (
          <View className="mt-2 p-2 bg-blue-50 rounded-lg">
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#1996D3" />
              <Text className="text-sm text-blue-700 ml-2">
                Uploading {selectedFile.name}...
              </Text>
            </View>
          </View>
        )}
        
        {/* File Limit Warning */}
        {attachments.length >= maxFiles - 2 && (
          <View className={`mt-2 p-2 rounded-lg ${
            nightMode ? 'bg-yellow-900 bg-opacity-30' : 'bg-yellow-50'
          }`}>
            <Text className={`text-sm ${
              nightMode ? 'text-yellow-300' : 'text-yellow-700'
            }`}>
              {attachments.length >= maxFiles 
                ? `Maximum ${maxFiles} files reached`
                : `${maxFiles - attachments.length} more files allowed`
              }
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default FileInputComponent;