import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { UpdateInstructionApi } from '../../service/BuggyListApis/UpdateInstructionApi';
import InputField from './InputField';
import convertUrlToBase64 from '../../service/ImageUploads/BlobImageConvert';
import { uploadImageToServer } from '../../service/ImageUploads/ConvertImageToUrlApi';
import convertPdfUrlToBase64 from "./ConvertToPdfDownload";
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const BuggyListCard = ({ item, onUpdateSuccess, WoUuId }) => {
  const [inputValue, setInputValue] = useState(item.result || '');
  const [remark, setRemark] = useState(item.remarks || '');
  const [editingRemark, setEditingRemark] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfPreview, setPdfPreview] = useState(null);
  // Convert image URL to base64 for preview
 
const {ppmAsstPermissions}  = usePermissions()
  // Save the instruction when inputValue changes
  useEffect(() => {


   
    const saveInstruction = async () => {
      if (inputValue !== item.result) {
        try {
          const payload = {
            id: item.id,
            remark,
            value: inputValue,
            WoUuId,
            image: false,
          };
          await UpdateInstructionApi(payload);
          onUpdateSuccess(); // Call the success callback
        } catch (error) {
          console.error('Error saving instruction:', error);
        }
      }
    };
  
    if(item.type !== 'file' && item.type !== 'document'){
    saveInstruction();
    }
  }, [inputValue, item.result, remark, WoUuId, onUpdateSuccess]);

  // Image picker using the camera
  const handleImagePicker = useCallback(async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled && result.assets[0]) {
        const uploadResponse = await uploadImageToServer(
          result.assets[0].uri,
          item.id,
          WoUuId,
          result.assets[0].mimeType
        );
        if (uploadResponse) {
          onUpdateSuccess();
        }
      }
    } catch (error) {
      console.error('Error during image picking/uploading:', error);
    }
  }, [item.id, WoUuId, onUpdateSuccess]);

  // Document picker for browsing files
  const handleBrowseImage = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });
      if (result.type !== 'cancel' && result.uri) {
        const uploadResponse = await uploadImageToServer(
          result.uri,
          item.id,
          WoUuId,
          result.mimeType
        );
        if (uploadResponse) {
          onUpdateSuccess();
        }
      }
    } catch (error) {
      console.error('Error during document browsing/uploading:', error);
    }
  }, [item.id, WoUuId, onUpdateSuccess]);

  // Save remark on blur
  const handleRemarkBlur = useCallback(async () => {
    try {
      const payload = {
        id: item.id,
        remark,
        value: inputValue,
        WoUuId,
        image: false,
      };
      await UpdateInstructionApi(payload);
      onUpdateSuccess(); // Call the success callback
    } catch (error) {
      console.error('Error saving remark:', error);
    }
  }, [item.id, inputValue, remark, WoUuId, onUpdateSuccess]);

  // Determine background color based on item properties
  const cardBackgroundColor = item.type === 'checkbox'
  ? item.result === '1' // Check if result is '1' for green
    ? '#e6ffe6' // Faint green if result is '1'
    : 'white' // Default white if result is not '1'
  : item.result // If item has result, image, or file
    ? '#e6ffe6' // Faint green
    : 'white'; // Default white

  return (
    <View style={[styles.cardContainer, { backgroundColor: cardBackgroundColor }]}>
      {item.type === 'checkbox' ? (
        <View className="flex flex-row">
          <InputField
            WoUuId={WoUuId}
            item={item}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onDocumentPick={handleBrowseImage}
            pdfPreviewUrl={pdfPreview}
            onUpdateSuccess={onUpdateSuccess}
          />
        </View>
      ) : (
        <>
          <Text className="pt-3 pb-2" style={styles.title}>{item.title}</Text>
          <InputField
            WoUuId={WoUuId}
            item={item}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onDocumentPick={handleBrowseImage}
            imagePreviewUrl={imagePreviewUrl}
            pdfPreviewUrl={pdfPreview}
            onUpdateSuccess={onUpdateSuccess}
          />
        </>
      )}

      <View style={styles.remarkContainer}>
        <Text style={styles.label}>Remark:</Text>
        {ppmAsstPermissions.some((permission) => permission.includes('U')) && editingRemark ? (
          <TextInput
            style={styles.remarkInput}
            placeholder="Enter remark"
            value={remark}
            onChangeText={setRemark}
            placeholderTextColor="#888"
            onBlur={handleRemarkBlur} // Call the API when input loses focus
          />
        ) : (
          <TouchableOpacity onPress={() => setEditingRemark(true)}>
            <Text style={styles.remarkText}>{remark || 'No remarks provided'}</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    flex: 1,
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 8,
  },
  remarkContainer: {
    marginTop: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#074B7C',
  },
  remarkInput: {
    borderWidth: 1,
    borderColor: '#1996D3',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
  },
  remarkText: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 10,
    right: 0,
    zIndex: 1,
  },
  bookmarkIcon: {
    width: 24,
    height: 24,
  },
});

export default BuggyListCard;
