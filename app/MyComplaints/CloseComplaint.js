import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Image,
  StyleSheet
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
import useConvertToIST from '../TimeConvertot/ConvertUtcToIst';
import { usePermissions } from '../GlobalVariables/PermissionsContext';
import CommentInput from './CommentInput';
import { RenderComment } from './CommentCards';
import ImageViewing from "react-native-image-viewing";
import { complaintService } from '../../services/apis/complaintApis';
const ComplaintCloseScreen = ({ route }) => {
  const { complaint, category, creator } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupConfig, setPopupConfig] = useState({});
  const navigation = useNavigation();
  const { complaintPermissions } = usePermissions();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);
  useEffect(() => {
    fetchComments();
  }, []);





  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);


  const fetchComments = async () => {
    try {
      const fetchedComments = await complaintService.getComplaintComments(complaint.id);
      setComments(fetchedComments);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch comments. Please try again.');
    }
  };


  const handleAddComment = async (data) => {
    if (newComment.trim()) {
      try {
        setIsPosting(true);
        await complaintService.addComplaintComment(complaint.id, data.remarks, data.file);
        fetchComments();
        setNewComment('');
      } catch (error) {
        Alert.alert('Error', 'Failed to post comment. Please try again.');
      } finally {
        setIsPosting(false);
      }
    } else {
      Alert.alert('Empty Comment', 'Please enter a comment before submitting.');
    }
  };

  const handleCloseComplaint = () => {
    if (complaint.ask_otp === 1) {
      setIsOtpMode(true);
    } else {
      setPopupConfig({
        type: 'alert',
        message: 'Are you sure you want to close this complaint?',
        onOk: async () => {
          try {
            const payload = {
              ...complaint,
              status: "Closed",
            };
            if (otp) {
              payload.otp = otp
            }
            const response = await complaintService.closeComplaint(payload);
            if (response.status === 'success') {
              setPopupConfig({
                type: 'success',
                message: 'Complaint closed successfully!',
              });
              setPopupVisible(true);
              setTimeout(() => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Service Request' }],
                  })
                );
              }, 3000);
            } else {
              setPopupConfig({
                type: 'error',
                message: response.message || 'Failed to close the complaint.',
                onOk: () => setPopupVisible(false)
              });
              setPopupVisible(true);
            }
          } catch (error) {
            setPopupConfig({
              type: 'error',
              message: 'An error occurred. Please try again.',
              onOk: () => setPopupVisible(false)
            });
            setPopupVisible(true);
            navigation.goBack()

          }
        },
        onCancel: () => setPopupVisible(false),

      });
      setPopupVisible(true);
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length === 4) {
      setIsOtpMode(false);
      try {
        payload = {
    ...complaint, 
    status: "Closed",
  };
  if(otp){
    payload.otp = otp
  }
        const response = await complaintService.closeComplaint(payload);
        if (response.status === 'success') {
          setPopupConfig({
            type: 'success',
            message: 'Complaint closed successfully!',
          });
          setPopupVisible(true);
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Service Request' }],
            })
          );
        } else {
          setPopupConfig({
            type: 'error',
            message: <Text className='font-bold'>Incorrect OTP. Please check and try again.</Text>,
          });
          setPopupVisible(true);
        }
      } catch (error) {
        setPopupConfig({
          type: 'error',
          message: 'An error occurred. Please try again.',
          onOk: () => setPopupVisible(false)
        });
        setPopupVisible(true);

      }
    } else {
      Alert.alert('Error', 'Please enter a valid 4-digit OTP.');
    }
  };



  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView>
        <View className="flex-1 bg-gray-50 p-4 pb-48">
          {/* Complaint Details */}
          <View className="bg-white p-4 rounded-lg shadow-md mb-4 relative">
            <View>

              {complaint.img_src && (
                <>
                  {/* Clickable Image */}
                  <TouchableOpacity onPress={() => setIsImageVisible(true)}>
                    <Image
                      source={{ uri: complaint.img_src }}
                      style={{ width: '100%', height: 200, resizeMode: 'cover', borderRadius: 10 }}
                    />
                  </TouchableOpacity>

                  {/* Zoomable Image Modal */}
                  {isImageVisible && (
                    <ImageViewing
                      images={[{ uri: complaint.img_src }]}
                      imageIndex={0}
                      visible={isImageVisible}
                      onRequestClose={() => setIsImageVisible(false)}
                    />
                  )}
                </>
              )}

            </View>
            <View className="flex flex-row bg-gray-100 justify-between p-2 rounded-lg items-center mt-2">
              <Text className="text-blue-500 text-lg font-bold py-2">{complaint.com_no}</Text>

              <Text className="bg-green-400 rounded-full text-white font-extrabold px-2 py-1">{complaint.status}</Text>

            </View>



            <View>


              <View className="flex-row items-center mb-3 mt-1">
                <Text style={styles.text} className=" text-gray-600 w-24 font-semibold ">Category  :</Text>
                <Text
                  className="bg-blue-400 rounded-md text-sm text-white font-semibold max-w-[75%] px-2 py-1"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {category}
                </Text>

              </View>
              {creator && <View className="flex-row items-center mb-3">
                <Text style={styles.text} className="text-base text-gray-600 w-34 font-semibold">Created By : </Text>

                <View className="flex-row bg-gray-600 rounded-lg items-center px-3 py-1">
                  <FontAwesome name="user" size={14} color="white" className="mr-1" />
                  <Text className="text-sm text-white font-bold ml-1">{creator}</Text>
                </View>
              </View>}

            </View>





            {complaint && (
              <View className="flex justify-between gap-2 items-start mt-2">

                {/* Display Unit */}
                {complaint?.display_unit_no && <View className="flex-row rounded-lg items-center py-1">
                  {/* <FontAwesome name="map-marker" size={16} color="#D32F2F" className="mr-2" /> */}
                  <Text> Display Unit : </Text>
                  <Text className="bg-gray-200 rounded-md text-black font-bold ml-1 px-2">
                    {complaint.display_unit_no || 'N/A'}
                  </Text>
                </View>
                }
                {/* Reference Unit */}
                {complaint?.reference_unit_no && <View className="flex-row rounded-lg items-center py-1">
                  {/* <FontAwesome name="link" size={16} color="#F57C00" className="mr-2" /> */}
                  <Text> Ref. Unit      : </Text>
                  <Text className="bg-gray-300 rounded-md text-black font-bold ml-1 px-2">
                    {complaint.reference_unit_no ?
                      complaint.resource.reference_unit_no.slice(0, 10) + "..." : 'N/A'}
                  </Text>
                </View>}

              </View>
            )}



            <View style={styles.container}>
              <ScrollView
                style={styles.scrollView}
                nestedScrollEnabled={true} // Allows inner scrolling in Android
                keyboardShouldPersistTaps="handled" // Ensures taps work inside ScrollView
                showsVerticalScrollIndicator={true} // Shows scrollbar
              >
                <View>
                  <Text style={styles.text}>{complaint.description}</Text>
                </View>
              </ScrollView>
            </View>
            <View className="flex-row mt-2">
              <Text className="text-gray-600">Created on: </Text>
              <Text className="text-black font-bold">{useConvertToIST(complaint.created_at)}</Text>
            </View>
            <View className="flex-row justify-end items-center mt-4">
              {complaint.status !== 'Closed' && complaintPermissions.some((permission) => permission.includes('U')) && (
                <TouchableOpacity
                  className="bg-blue-500 rounded-lg px-4 py-2"
                  onPress={handleCloseComplaint}
                >
                  <Text className="text-white font-extrabold">Close Complaint</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Comments List */}
          <ScrollView className="flex-1">
            <Text className="text-gray-900 text-lg font-bold mb-2">Comments</Text>

            {/* Map over comments instead of FlatList */}
            {comments.length > 0 ? (
              comments.map((item, index) => (
                <View key={index}>
                  <RenderComment item={item} />
                </View>
              ))
            ) : (
              <Text className="text-center text-gray-500 mt-4">No comments yet.</Text>
            )}
          </ScrollView>
        </View>
      </ScrollView>
      {/* Comment Input */}

      <View style={{
        position: 'absolute',
        bottom: keyboardVisible ? 0 : 55,
        left: 0,
        right: 0,
        padding: 8,
        borderTopWidth: 1,
        borderColor: '#d1d5db'
      }}>
        <CommentInput
          value={newComment}
          onChangeText={setNewComment}
          onSubmit={handleAddComment}
          isPosting={isPosting}
        />
      </View>

      {/* OTP Modal */}
      <Modal visible={isOtpMode} transparent animationType="slide">
        <View className="flex-1 bg-opacity-20 bg-transparent justify-center items-center">
          <View className="bg-[#094879] p-5 rounded-lg shadow-lg w-4/5">
            <Text className="text-lg text-white font-bold mb-4">Enter OTP</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg text-center w-full mb-4 px-3 py-2"
              placeholder="Enter 4-digit OTP"
              keyboardType="numeric"
              maxLength={4}
              value={otp}
              onChangeText={setOtp}
            />
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-gray-500 rounded-lg px-4 py-2"
                onPress={() => setIsOtpMode(false)}
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-500 rounded-lg px-4 py-2"
                onPress={handleOtpSubmit}
              >
                <Text className="text-white font-semibold">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Popup */}
      {popupVisible && (
        <DynamicPopup
          {...popupConfig}
          onClose={() => setPopupVisible(false)}
        />
      )}
    </KeyboardAvoidingView>

  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 120, // Adjust height to fit about 4 lines
    overflow: 'hidden',
  },
  scrollView: {
    padding: 2,
  },
  text: {
    fontSize: Platform.OS === 'ios' ? 14 : 15, // Reduce size by 20% only on iOS
  },
});

export default ComplaintCloseScreen;
