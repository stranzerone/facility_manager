import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { uploadImageToServer } from "../../../service/ImageUploads/ConvertImageToUrlApi";

const { width } = Dimensions.get("window");

const FileInputComponent = ({ setAttachments, setNote, attachments }) => {
  const [remark, setRemark] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const onChangeText = (text) => setRemark(text);

  const onInputBlur = () => {
    if (remark.trim()) {
      setNote(remark.trim());
    }
  };

  const onPickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const file = result.assets[0];
        const fileSizeInMB = (file.size || 0) / (1024 * 1024);

        if (fileSizeInMB > 10) return;

        const fileData = {
          uri: file.uri,
          fileName: file.name,
          mimeType: file.mimeType,
        };

        setSelectedFile(file);
        setIsUploading(true);
        setUploadSuccess(false);

        const uploadResponse = await uploadImageToServer(fileData, null, null, true);
        if (uploadResponse) {
          setUploadSuccess(true);
          setAttachments([...attachments, uploadResponse.data.url]);
        }
      }
    } catch (error) {
      console.error("Document selection error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Add Note..."
        placeholderTextColor="#A0A0A0"
        value={remark}
        onChangeText={onChangeText}
        onBlur={onInputBlur}
        multiline
      />

      <TouchableOpacity
        onPress={onPickFile}
        style={[
          styles.attachmentButton,
          uploadSuccess && { backgroundColor: "#16A34A" }, // green if success
        ]}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Icon name="paperclip" size={18} color="#fff" />
        )}
      </TouchableOpacity>

      {selectedFile && (
        <Text style={styles.fileName}>Selected File: {selectedFile.name}</Text>
      )}

      {/* Display count of uploaded files */}
      {attachments.length > 0 && (
        <View style={styles.uploadedFilesContainer}>
          <Text style={styles.uploadedFilesTitle}>Selected Files:</Text>
          <Text style={styles.uploadedFileName}>
            {attachments.length} {attachments.length === 1 ? "file" : "files"} uploaded
          </Text>
        </View>
      )}
    </View>
  );
};

export default FileInputComponent;

const styles = {
  container: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 10,
    marginVertical: 8,
    width: width * 0.9,
    alignSelf: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    color: "#374151",
    width: "85%",
    alignSelf: "flex-start",
  },
  attachmentButton: {
    position: "absolute",
    right: 10,
    top: 12,
    backgroundColor: "#2563EB", // default blue
    borderRadius: 50,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  fileName: {
    marginTop: 10,
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "left",
  },
  uploadedFilesContainer: {
    display:"flex", 
    gap:5,
    flexDirection: "row",
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
    paddingTop: 10,
  },
  uploadedFilesTitle: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "bold",
  },
  uploadedFileName: {
    fontSize: 12,
    color: "#1E293B",
    marginVertical: 2,
  },
};
