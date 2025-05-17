import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
// import { Camera } from "react-native-vision-camera";
import { useNavigation } from "@react-navigation/native";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { uploadImageToServer } from "../../service/ImageUploads/ConvertImageToUrlApi";
import styles from "../BuggyListCardComponets/InputFieldStyleSheet";
import RemarkCard from "./RemarkCard";
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";
import ImageViewing from "react-native-image-viewing";

const FileCard = ({ item, onUpdate, editable }) => {
  const [capturedImage, setCapturedImage] = useState(item.result || null);
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const updatedTime = useConvertToSystemTime(item?.updated_at);
  const navigation = useNavigation();

  // useEffect(() => {
  //   (async () => {
  //     const status = await Camera.getCameraPermissionStatus();
  //     if (status === "granted") {
  //       setHasPermission(true);
  //     } else {
  //       const newStatus = await Camera.requestCameraPermission();
  //       setHasPermission(newStatus === "authorized");
  //     }
  //   })();
  // }, []);

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

  const handleCaptureImage = async () => {


    navigation.navigate("CameraScreen", {
      onPictureTaken: async (uri) => {
        try {
          setLoading(true);

          // Compress image
          const compressedUri = await compressImage(uri);

          const fileData = {
            uri: compressedUri,
            fileName: `photo_${Date.now()}.jpeg`,
            mimeType: "image/jpeg",
          };

          await uploadImageToServer(fileData, item.id, item.ref_uuid);
          setCapturedImage(compressedUri);
          onUpdate();
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
      className="shadow-md rounded-lg p-4"
      style={[
        styles.inputContainer,
        editable
          ? item.result || capturedImage
            ? { backgroundColor: "#DFF6DD" }
            : { backgroundColor: "white" }
          : item.result || capturedImage
          ? { backgroundColor: "#DCFCE7" }
          : { backgroundColor: "#E5E7EB" },
      ]}
    >
        <View className="flex-row p-2">
      <Text className="font-bold  text-xl mr-2">{item.order}.</Text>
      
      <Text style={styles.title}>{item.title}</Text>

      </View>

      <View className="flex flex-row">
        <View className="w-1/2 flex items-center justify-center">
          {loading ? (
            <Text className="text-gray-500">Loading...</Text>
          ) : capturedImage ? (
            <TouchableOpacity disabled={!editable} onPress={() => setModalVisible(true)}>
              <Image
                style={styles.imageAttachmentContainer}
                source={{ uri: capturedImage }}
                className="w-28 h-28 rounded-md"
              />
            </TouchableOpacity>
          ) : (
            <View className="w-32 h-32 border border-blue-900 bg-gray-200 rounded-md flex items-center justify-center">
              <Ionicons name="image-outline" size={40} color="#CED4DA" />
              <Text className="text-gray-500 text-xs mt-2">No image selected</Text>
            </View>
          )}
        </View>

        <View className="w-1/2 flex items-center justify-center">
          <TouchableOpacity
            style={styles.cameraButton}
            className="bg-blue-600 py-2 px-4 rounded-md flex gap-1 items-center justify-center"
            onPress={handleCaptureImage}
            disabled={!editable}
          >
            <Ionicons name="camera" size={24} color="white" />
            <Text className="text-white text-sm mt-1">Capture Image</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-4">
        <RemarkCard
          className="mt-4"
          item={item}
          editable={editable}
          onRemarkChange={(id, newRemark) =>
            console.log(`Remark updated for ${id}: ${newRemark}`)
          }
        />

        <View className="flex-1 bg-transparent justify-end px-4 py-2 mt-4 h-8">
          {item.result || item?.data?.optional ? (
            <View>
              {item.result && updatedTime && (
                <Text className="text-gray-500 text-[11px] font-bold">
                  Updated at : {updatedTime}
                </Text>
              )}
            </View>
          ) : null}
          {item?.data?.optional && (
            <View className="flex-row justify-end gap-1 items-center absolute bottom-2 right-0">
              <Icon name="info-circle" size={16} color="red" />
              <Text className="text-xs text-red-800 font-bold mr-2">Optional</Text>
            </View>
          )}
        </View>
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
