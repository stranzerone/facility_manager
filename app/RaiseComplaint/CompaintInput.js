import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import DynamicPopup from "../DynamivPopUps/DynapicPopUpScreen";
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { complaintService } from '../../services/apis/complaintApis';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const NewComplaintPage = ({ route }) => {
  const { subCategory, category } = route.params;
  const { nightMode } = usePermissions();
  
  const [location, setLocation] = useState('');
  const [allLocations, setAllLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInputActive, setInputActive] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [selfAssign, setSelfAssign] = useState(false);
  const [longUrl, setLongUrl] = useState('');
  const navigation = useNavigation();

  useLayoutEffect(() => {
    const fetchAllLocations = async () => {
      try {
        setLoading(true);
        const response = await complaintService.getComplaintLocations();
        setAllLocations(response);
        setFilteredLocations(response);
      } catch {
        setError('Error fetching location options');
      } finally {
        setLoading(false);
      }
    };
    fetchAllLocations();
  }, []);

  const handleLocationInput = (text) => {
    setLocation(text);
    if (text) {
      const filtered = allLocations.filter((loc) =>
        loc.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(allLocations);
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
      setLongUrl(`data:image/jpeg;base64,${base64}`);
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      Alert.alert('Error', 'Failed to process the image. Please try again.');
      return null;
    }
  };

  const pickImage = () => {
    navigation.navigate('CameraScreen', {
      onPictureTaken: async (imageUri) => {
        setImage(imageUri);
        try {
          setImageLoading(true);
          const base64 = await compressAndConvertToBase64(imageUri);
          if (base64) {
            setLongUrl(base64);
            setImageUrl(imageUri);
          }
        } catch {
          Alert.alert('Error', 'Failed to process the image.');
        } finally {
          setImageLoading(false);
        }
      },
    });
  };

  const submitComplaint = async () => {
    if (subCategory.name === 'other' && !description.trim()) {
      Alert.alert("Validation", "Please enter Description to add Complaint");
      return;
    }

    setLoading(true);
    setPopupVisible(false);

    const data = {
      category,
      data: subCategory,
      society: location.id || null,
      description,
      image: longUrl,
      selfAssign,
    };

    try {
      const response = await complaintService.createComplaint(data);
      if (response.status === 'success') {
        setPopupType('success');
        setPopupMessage('Complaint submitted successfully!');
        setPopupVisible(true);
        setTimeout(() => {
          setPopupVisible(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Service Request' }],
            })
          );
        }, 1000);
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      setPopupType('error');
      setPopupMessage('Failed to submit complaint. Please try again.');
      setPopupVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const locationClicked = (item) => {
    setLocation(item);
    setInputActive(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, nightMode && styles.safeAreaDark]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 40}
      >
        <ScrollView style={styles.container}>
          {/* Category */}
          <View style={[styles.section, nightMode && styles.sectionDark]}>
            <Text style={[styles.label, nightMode && styles.labelDark]}>Category</Text>
            <Text style={[styles.valueText, nightMode && styles.valueTextDark]}>
              {category.name || 'Not selected'}
            </Text>
          </View>

          {/* Sub-Category */}
          <View style={[styles.section, nightMode && styles.sectionDark]}>
            <Text style={[styles.label, nightMode && styles.labelDark]}>Sub Category</Text>
            <Text style={[styles.valueText, nightMode && styles.valueTextDark]}>
              {subCategory.name || 'Not selected'}
            </Text>
          </View>

          {/* Location */}
          <View style={[styles.section, nightMode && styles.sectionDark]}>
            <Text style={[styles.label, nightMode && styles.labelDark]}>Location</Text>
            <TextInput
              style={[styles.input, nightMode && styles.inputDark]}
              placeholder="Enter location"
              placeholderTextColor={nightMode ? "#888" : "#999"}
              value={location.name || location}
              onFocus={() => setInputActive(true)}
              onChangeText={handleLocationInput}
              selectionColor={nightMode ? "#74B9FF" : undefined}
            />
            {loading && (
              <ActivityIndicator size="small" color="#1996D3" style={styles.loader} />
            )}
            {isInputActive && (
              <View style={[styles.locationList, nightMode && styles.locationListDark]}>
                {filteredLocations.length ? filteredLocations.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => locationClicked(item)}
                  >
                    <Text style={[styles.locationOption, nightMode && styles.locationOptionDark]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )) : (
                  <Text style={[styles.locationOption, nightMode && styles.locationOptionDark]}>
                    No location options found
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={[styles.section, nightMode && styles.sectionDark]}>
            <Text style={[styles.label, nightMode && styles.labelDark]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea, nightMode && styles.inputDark]}
              placeholder="Enter description"
              placeholderTextColor={nightMode ? "#888" : "#999"}
              value={description}
              onChangeText={setDescription}
              multiline
              selectionColor={nightMode ? "#74B9FF" : undefined}
            />
          </View>

          {/* Image Section */}
          <View style={[styles.imageSection, nightMode && styles.sectionDark]}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <Text style={[styles.noImageText, nightMode && styles.noImageTextDark]}>
                No image selected
              </Text>
            )}
            <TouchableOpacity
              style={[styles.imagePicker, nightMode && styles.imagePickerDark]}
              onPress={pickImage}
              disabled={imageLoading}
            >
              {imageLoading ? (
                <ActivityIndicator size="small" color="#1996D3" />
              ) : (
                <>
                  <Text style={[styles.imagePickerText, nightMode && styles.imagePickerTextDark]}>
                    Capture Image
                  </Text>
                  <FontAwesome name="camera" size={20} color={nightMode ? "#74B9FF" : "#1996D3"} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Self Assign */}
          <View style={[styles.selfAssignContainer, nightMode && styles.selfAssignContainerDark]}>
            <Text style={[styles.selfAssignLabel, nightMode && styles.selfAssignLabelDark]}>Self Assign</Text>
            <TouchableOpacity onPress={() => setSelfAssign(!selfAssign)}>
              <View
                style={[
                  styles.checkbox,
                  selfAssign ? styles.checkboxChecked : styles.checkboxUnchecked,
                  nightMode && (selfAssign ? styles.checkboxCheckedDark : styles.checkboxUncheckedDark),
                ]}
              >
                {selfAssign && <View style={styles.checkboxInner} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={submitComplaint}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Popup */}
          {popupVisible && (
            <DynamicPopup
              type={popupType}
              message={popupMessage}
              onClose={() => setPopupVisible(false)}
            />
          )}

          {/* Error */}
          {error ? (
            <Text style={[styles.errorMessage, nightMode && styles.errorMessageDark]}>{error}</Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeAreaDark: {
    backgroundColor: '#121212',
  },
  container: {
    padding: 10,
    paddingBottom: 30,
  },
  section: {
    padding: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'gray',
  },
  sectionDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  labelDark: {
    color: '#E5E5EA',
  },
  valueText: {
    fontSize: 16,
    color: '#1996D3',
    marginTop: 5,
  },
  valueTextDark: {
    color: '#74B9FF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#1996D3',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    color: '#000000',
  },
  inputDark: {
    backgroundColor: '#2C2C2E',
    borderColor: '#444',
    color: '#E5E5EA',
  },
  textarea: {
    height: 70,
    textAlignVertical: 'top',
  },
  loader: {
    marginTop: 10,
  },
  locationList: {
    maxHeight: 200,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1996D3',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  locationListDark: {
    backgroundColor: '#2C2C2E',
    borderColor: '#444',
  },
  locationOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    color: '#1996D3',
  },
  locationOptionDark: {
    color: '#74B9FF',
    borderBottomColor: '#555',
  },
  imageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'gray',
    backgroundColor: '#FFFFFF',
  },
  previewImage: {
    width: 96,
    height: 96,
    borderRadius: 8,
  },
  noImageText: {
    color: '#074B7C',
    fontSize: 14,
  },
  noImageTextDark: {
    color: '#74B9FF',
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1996D3',
    borderRadius: 8,
  },
  imagePickerDark: {
    borderColor: '#74B9FF',
  },
  imagePickerText: {
    color: '#1996D3',
    marginRight: 10,
    fontSize: 14,
  },
  imagePickerTextDark: {
    color: '#74B9FF',
  },
  selfAssignContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'gray',
    backgroundColor: '#FFFFFF',
  },
  selfAssignContainerDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333',
  },
  selfAssignLabel: {
    fontSize: 16,
    color: '#000',
  },
  selfAssignLabelDark: {
    color: '#E5E5EA',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    borderColor: '#1996D3',
    backgroundColor: 'transparent',
  },
  checkboxUncheckedDark: {
    borderColor: '#74B9FF',
  },
  checkboxChecked: {
    borderColor: '#074B7C',
    backgroundColor: 'rgba(7, 75, 124, 0.2)',
  },
  checkboxCheckedDark: {
    borderColor: '#74B9FF',
    backgroundColor: 'rgba(116, 185, 255, 0.2)',
  },
  checkboxInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#074B7C',
  },
  submitButton: {
    backgroundColor: '#074B7C',
    borderRadius: 8,
    marginBottom: 20,
    paddingVertical: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#555',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  errorMessageDark: {
    color: '#FF6B6B',
  },
});

export default NewComplaintPage;
