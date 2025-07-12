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
  StyleSheet,
  Dimensions
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
import useConvertToIST from '../TimeConvertot/ConvertUtcToIst';
import { usePermissions } from '../GlobalVariables/PermissionsContext';
import CommentInput from './CommentInput';
import { RenderComment } from './CommentCards';
import ImageViewing from "react-native-image-viewing";
import { complaintService } from '../../services/apis/complaintApis';


const ComplaintCloseScreen = ({ route }) => {
  const { complaint, category, creator, location } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupConfig, setPopupConfig] = useState({});
  const navigation = useNavigation();
  const { complaintPermissions, nightMode,closeComplaintPermission } = usePermissions();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);
  // Theme configuration
  const theme = {
    light: {
      background: '#F8FAFC',
      cardBackground: '#FFFFFF',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF',
      border: '#E5E7EB',
      shadow: '#000000',
      accent: '#3B82F6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      gradientStart: '#3B82F6',
      gradientEnd: '#1E40AF',
      modalOverlay: 'rgba(0, 0, 0, 0.5)',
      inputBackground: '#FFFFFF',
      statusBadge: '#10B981',
      categoryBadge: '#3B82F6',
      userBadge: '#6B7280',
      unitBadge: '#E5E7EB',
    },
    dark: {
      background: '#0F172A',
      cardBackground: '#1E293B',
      textPrimary: '#F1F5F9',
      textSecondary: '#CBD5E1',
      textMuted: '#94A3B8',
      border: '#334155',
      shadow: '#000000',
      accent: '#60A5FA',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      gradientStart: '#1E40AF',
      gradientEnd: '#0F172A',
      modalOverlay: 'rgba(0, 0, 0, 0.8)',
      inputBackground: '#334155',
      statusBadge: '#34D399',
      categoryBadge: '#60A5FA',
      userBadge: '#64748B',
      unitBadge: '#475569',
    }
  };

  const currentTheme = nightMode ? theme.dark : theme.light;


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
        const response =   await complaintService.addComplaintComment(complaint.id, data.remarks, data.file);
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
              payload.otp = otp;
            }
            const response = await complaintService.closeComplaint(payload);
            if (response.status === 'success') {
              setPopupConfig({
                type: 'success',
                message: 'Complaint closed successfully!',
              });
              setPopupVisible(true);
              setTimeout(() => {
                navigation.goBack()
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
        const payload = {
          ...complaint,
          status: "Closed",
        };
        if (otp) {
          payload.otp = otp;
        }
        const response = await complaintService.closeComplaint(payload);
        if (response.status === 'success') {
          setPopupConfig({
            type: 'success',
            message: 'Complaint closed successfully!',
          });
          setPopupVisible(true);
                navigation.goBack()
         
        } else {
          setPopupConfig({
            type: 'error',
            message: 'Incorrect OTP. Please check and try again.',
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

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    card: {
      backgroundColor: currentTheme.cardBackground,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      shadowColor: currentTheme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: nightMode ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: nightMode ? 8 : 3,
      borderWidth: nightMode ? 1 : 0,
      borderColor: currentTheme.border,
    },
    textPrimary: {
      color: currentTheme.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    textSecondary: {
      color: currentTheme.textSecondary,
      fontSize: 14,
      fontWeight: '500',
    },
    textMuted: {
      color: currentTheme.textMuted,
      fontSize: 12,
    },
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'flex-start',
    },
    statusBadge: {
      backgroundColor: currentTheme.statusBadge,
    },
    categoryBadge: {
      backgroundColor: currentTheme.categoryBadge,
    },
    userBadge: {
      backgroundColor: currentTheme.userBadge,
    },
    unitBadge: {
      backgroundColor: currentTheme.unitBadge,
    },
    modalContent: {
      backgroundColor: currentTheme.cardBackground,
      borderRadius: 20,
      padding: 24,
      margin: 20,
      shadowColor: currentTheme.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 10,
    },
    input: {
      backgroundColor: currentTheme.inputBackground,
      borderColor: currentTheme.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: currentTheme.textPrimary,
      textAlign: 'center',
    },
    button: {
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
      minWidth: 100,
      alignItems: 'center',
    },
    closeButton: {
      borderRadius: 25,
      paddingVertical: 12,
      paddingHorizontal: 24,
      minWidth: 150,
      alignItems: 'center',
    },
  });

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, padding: 16, paddingBottom: 200 }}>
          {/* Enhanced Complaint Details Card */}
          <View >
            {/* Image Section with Enhanced Styling */}
            {complaint.img_src && (
              <View style={{ marginBottom: 16 }}>
                <TouchableOpacity onPress={() => setIsImageVisible(true)}>
                  <Image
                    source={{ uri: complaint.img_src }}
                    style={{
                      width: '100%',
                      height: 200,
                      borderRadius: 16,
                      resizeMode: 'cover',
                    }}
                  />
                  <View style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    borderRadius: 20,
                    padding: 8,
                  }}>
                    <FontAwesome name="expand" size={16} color="white" />
                  </View>
                </TouchableOpacity>

                {isImageVisible && (
                  <ImageViewing
                    images={[{ uri: complaint.img_src }]}
                    imageIndex={0}
                    visible={isImageVisible}
                    onRequestClose={() => setIsImageVisible(false)}
                  />
                )}
              </View>
            )}

            {/* Header Section with Complaint Number and Status */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: nightMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}>
              <View>
                <Text style={[dynamicStyles.textMuted, { marginBottom: 4 }]}>
                  Complaint No.
                </Text>
                <Text style={[dynamicStyles.textPrimary, { fontSize: 18, fontWeight: 'bold', color: currentTheme.accent }]}>
                  {complaint.com_no}
                </Text>
              </View>
              <View style={[dynamicStyles.badge, dynamicStyles.statusBadge]}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                  {complaint.status}
                </Text>
              </View>
            </View>

            {/* Category and Creator Section */}
<View style={{ marginBottom: 16, backgroundColor: nightMode ? '#1f2937' : '#f9fafb', padding: 12, borderRadius: 12 }}>
  {/* Nature */}
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
    <FontAwesome name="tag" size={16} color={currentTheme.accent} style={{ marginRight: 8 }} />
    <Text style={[dynamicStyles.textSecondary, { marginRight: 12 }]}>Nature:</Text>
    <View style={{ backgroundColor: '#074B7C1A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
        <Text style={{ color: '#1996D3', fontWeight: '600', fontSize: 12 }}>
        {category?.name || 'N/A'}
      </Text>
    </View>
  </View>

  {/* Sub Nature */}
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
    <FontAwesome name="tag" size={16} color={currentTheme.accent} style={{ marginRight: 8 }} />
    <Text style={[dynamicStyles.textSecondary, { marginRight: 12 }]}>Sub Nature:</Text>
    <View style={{ backgroundColor: '#074B7C1A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
        <Text style={{ color: '#1996D3', fontWeight: '600', fontSize: 12 }}>
        {complaint?.sub_category || 'N/A'}
      </Text>
    </View>
  </View>

  {/* Location */}
{location &&  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
    <FontAwesome name="map-marker" size={16} color={currentTheme.accent} style={{ marginRight: 8 }} />
    <Text style={[dynamicStyles.textSecondary, { marginRight: 12 }]}>Location:</Text>
    <View style={{ backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
      <Text style={{ color: '#0369A1', fontWeight: '600', fontSize: 12 }}>
        {location?.name || 'N/A'}
      </Text>
    </View>
  </View>}

  {/* Created By */}
  {creator && (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <FontAwesome name="user" size={16} color={currentTheme.accent} style={{ marginRight: 8 }} />
      <Text style={[dynamicStyles.textSecondary, { marginRight: 12 }]}>Created By:</Text>
      <View style={{ backgroundColor: '#1996D31A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
        <Text style={{ color: '#1996D3', fontWeight: '600', fontSize: 12 }}>
          {creator}
        </Text>
      </View>
    </View>
  )}
</View>

{/* Unit Information Section */}
{(complaint?.display_unit_no || complaint?.reference_unit_no) && (
  <View
    style={{
      backgroundColor: nightMode ? 'rgba(107,114,128,0.1)' : 'rgba(107,114,128,0.05)',
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    }}
  >
    {/* Display Unit */}
    {complaint?.display_unit_no && (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <FontAwesome name="map-marker" size={14} color={currentTheme.textSecondary} style={{ marginRight: 8 }} />
        <Text style={[dynamicStyles.textSecondary, { marginRight: 8 }]}>Display Unit:</Text>
        <View style={{ backgroundColor: '#10B9811A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ color: '#047857', fontWeight: '600', fontSize: 11 }}>
            {complaint.display_unit_no}
          </Text>
        </View>
      </View>
    )}

    {/* Reference Unit */}
    {complaint?.reference_unit_no && (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <FontAwesome name="link" size={14} color={currentTheme.textSecondary} style={{ marginRight: 8 }} />
        <Text style={[dynamicStyles.textSecondary, { marginRight: 8 }]}>Ref. Unit:</Text>
        <View style={{ backgroundColor: '#10B9811A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ color: '#047857', fontWeight: '600', fontSize: 11 }}>
            {(complaint.resource?.reference_unit_no || '').length > 12
              ? complaint.resource.reference_unit_no.slice(0, 12) + '...'
              : complaint.resource.reference_unit_no || 'N/A'}
          </Text>
        </View>
      </View>
    )}
  </View>
)}
            {/* Description Section */}
            <View style={{
              backgroundColor: nightMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.05)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              maxHeight: 120,
            }}>
              <Text style={[dynamicStyles.textSecondary, { marginBottom: 8, fontWeight: 'bold' }]}>
                Description
              </Text>
              <ScrollView
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                <Text style={[dynamicStyles.textPrimary, { lineHeight: 20 }]}>
                  {complaint.description}
                </Text>
              </ScrollView>
            </View>

            {/* Created Date */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <FontAwesome name="clock-o" size={14} color={currentTheme.textMuted} style={{ marginRight: 8 }} />
              <Text style={dynamicStyles.textMuted}>Created on: </Text>
              <Text style={[dynamicStyles.textSecondary, { fontWeight: 'bold' }]}>
                {useConvertToIST(complaint.created_at)}
              </Text>
            </View>

            {/* Close Button */}

<TouchableOpacity
  disabled={complaint.status === "Closed" || closeComplaintPermission.some((permission) => permission.includes('U'))}
  className="p-3 text-center rounded-md"
  style={{
    backgroundColor: currentTheme.gradientStart,
    opacity: (complaint.status === "Closed" || closeComplaintPermission.some((permission) => permission.includes('U'))) ? 0.5 : 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }}
  onPress={handleCloseComplaint}
>
  {(complaint.status === "Closed" || closeComplaintPermission.some((permission) => permission.includes('U'))) && (
    <FontAwesome name="ban" size={14} color="#fff" style={{ marginRight: 6 }} />
  )}
  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
    Close Complaint
  </Text>
</TouchableOpacity>

          
          </View>

          {/* Enhanced Comments Section */}
          <View className="mt-6">
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <FontAwesome name="comments" size={20} color={currentTheme.accent} style={{ marginRight: 8 }} />
              <Text style={[dynamicStyles.textPrimary, { fontSize: 18, fontWeight: 'bold' }]}>
                Comments ({comments.length})
              </Text>
            </View>

            {comments.length > 0 ? (
              comments.map((item, index) => (
                <View key={index} style={{ marginBottom: 12 }}>
                  <RenderComment item={item} nightMode={nightMode} />
                </View>
              ))
            ) : (
              <View style={{
                alignItems: 'center',
                paddingVertical: 32,
                backgroundColor: nightMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.05)',
                borderRadius: 12,
              }}>
                <FontAwesome name="comment-o" size={32} color={currentTheme.textMuted} style={{ marginBottom: 8 }} />
                <Text style={[dynamicStyles.textMuted, { fontSize: 14 }]}>
                  No comments yet. Be the first to comment!
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Comment Input */}
      <View style={{
        position: 'absolute',
        bottom: keyboardVisible ? 100: 0,
        left: 0,
        right: 0,
        backgroundColor: currentTheme.cardBackground,
        borderTopWidth: 1,
        borderTopColor: currentTheme.border,
        paddingHorizontal: 1,
        shadowColor: currentTheme.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: nightMode ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 5,
      }}>
        <CommentInput
          value={newComment}
          onChangeText={setNewComment}
          onSubmit={handleAddComment}
          isPosting={isPosting}
          nightMode={nightMode}
        />
      </View>

      {/* Enhanced OTP Modal */}
      <Modal visible={isOtpMode} transparent animationType="slide">
        <View style={{
          flex: 1,
          backgroundColor: currentTheme.modalOverlay,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={dynamicStyles.modalContent}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <FontAwesome name="lock" size={32} color={currentTheme.accent} style={{ marginBottom: 12 }} />
              <Text style={[dynamicStyles.textPrimary, { fontSize: 20, fontWeight: 'bold', textAlign: 'center' }]}>
                Enter OTP
              </Text>
              <Text style={[dynamicStyles.textMuted, { textAlign: 'center', marginTop: 4 }]}>
                Please enter the 4-digit OTP to close this complaint
              </Text>
            </View>

            <TextInput
              style={[dynamicStyles.input, { marginBottom: 24, fontSize: 18, letterSpacing: 4 }]}
              placeholder="● ● ● ●"
              placeholderTextColor={currentTheme.textMuted}
              keyboardType="numeric"
              maxLength={4}
              value={otp}
              onChangeText={setOtp}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={[dynamicStyles.button, { backgroundColor: currentTheme.textMuted }]}
                onPress={() => setIsOtpMode(false)}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.button, { backgroundColor: currentTheme.accent }]}
                onPress={handleOtpSubmit}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Submit</Text>
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
          nightMode={nightMode}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default ComplaintCloseScreen;