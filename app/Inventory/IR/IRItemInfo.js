import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, FlatList } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import DynamicPopup from "../../DynamivPopUps/DynapicPopUpScreen"; // Corrected import path
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system'; // For downloading files
import ImageViewing from "react-native-image-viewing";
import Loader from "../../LoadingScreen/AnimatedLoader"
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { InventoryServices } from "../../../services/apis/InventoryApi";
import { usePermissions } from "../../GlobalVariables/PermissionsContext";
import ApprovalSelectionModal from "./ApprovalSelectionModel";

const IRDetailScreen = ({ route, navigation }) => {
  const { uuid, issueUuid } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [taxData, setTaxData] = useState([]);
  const [items, setItems] = useState([]);
  const [issue, setIssue] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [approvalList, setApprovalList] = useState([])
  const { nightMode } = usePermissions()
  
  // New state for approval selection modal
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState(null);

  // Theme styles based on nightMode
  const themeStyles = {
    container: nightMode ? 'bg-gray-900' : 'bg-white',
    text: nightMode ? 'text-white' : 'text-black',
    textSecondary: nightMode ? 'text-gray-300' : 'text-gray-800',
    textMuted: nightMode ? 'text-gray-400' : 'text-gray-500',
    cardBg: nightMode ? 'bg-gray-800' : 'bg-[#F9FAFB]',
    border: nightMode ? 'border-gray-600' : 'border-gray-200',
    infoBg: nightMode ? 'bg-gray-700' : 'bg-[#F8FAFC]',
    dropdownBg: nightMode ? 'bg-gray-800' : 'bg-white',
    statusBg: nightMode ? 'bg-blue-900' : 'bg-[#E0F2FE]',
    statusText: nightMode ? 'text-blue-300' : 'text-[#0284C7]',
    approverBg: nightMode ? 'bg-gray-700' : 'bg-white',
    shadowColor: nightMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'
  };

  const fetchItemInfo = async () => {
    setLoading(true);
    try {
      const response = await InventoryServices.getIssueInfo(issueUuid);
      const allData = response.data;
      setFullData(allData);
      setIssue(allData[0]?.issue || []);
      setItems(allData[0]?.item || []);
    } catch (error) {
      console.error("Error fetching data:", error.message || error);
    } finally {
      setLoading(false)
    }
  };

  const handleDownloadPDF = async (url) => {
    try {
      const fileName = url.split('/').pop();
      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri
      );

      const { uri } = await downloadResumable.downloadAsync();

      if (Platform.OS === 'ios' || await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Download Complete', `Saved to: ${uri}`);
      }

    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Could not download the PDF.');
    }
  };

  const fetchApprovalList = async () => {
    const response = await InventoryServices.getApprovalList()
    setApprovalList(response.data.filter((e) => e.active === true))
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchItemInfo();
      fetchApprovalList()
    }, [])
  );

  const fetchData = async () => {
    try {
      const taxResponse = await InventoryServices.getAllTaxes(uuid);
      setTaxData(taxResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error.message || error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTaxRateByUUID = (uuid) => {
    const tax = taxData?.find((t) => t.uuid === uuid);
    return tax ? tax.Rate : 0;
  };

  // Handle Request Approval Button Press - Show Modal
  const handleRequestApprovalPress = () => {
    if (issue.Status !== "DRAFT") return;
    setSelectedApprover(null); // Reset selection when opening modal
    setApprovalModalVisible(true);
  };

  // Handle final approval submission
  const handleFinalApproval = async (withApprover = false, approver = null) => {
    try {
      setIsLoading(true);
      
      if (withApprover && approver) {
        fullData[0].issue.approval_uuid = approver.uuid;
      }
      
      const response = await InventoryServices.requestApproval(fullData[0]);
      
      if (response && response.message === "Updated Successfully") {
        setPopupType("success");
        setPopupMessage(withApprover && approver 
          ? `Request sent to ${approver.Name} successfully!` 
          : "Request submitted successfully!"
        );
        setApprovalModalVisible(false); // Close modal only on success
      } else {
        setPopupType("error");
        setPopupMessage(response?.message || "Request submission failed!");
      }
    } catch (error) {
      console.error('Error updating status:', error.message || error);
      setPopupType("error");
      setPopupMessage("Failed to submit request. Please try again.");
    } finally {
      setIsLoading(false);
      setPopupVisible(true);
    }
  };

  const handlePopupClose = () => {
    setPopupVisible(false);
    navigation.navigate("IssuedRequests", { uuid: uuid });
  };

  if (loading) {
    return <Loader />
  }

  const approver = approvalList?.find(a => a.uuid === issue?.approval_uuid);

  return (
    <View className={`flex-1 ${themeStyles.container} pb-12 `}>
      <ScrollView className="px-4 pt-5" >
        {/* Header */}
        <View className={`mb-6 ${themeStyles.border} border-b pb-4`}>
          <View className="flex-row justify-between items-center mb-1">
            <Text className={`text-xl font-bold ${nightMode ? 'text-blue-400' : 'text-[#074B7C]'}`}>
              Issue Request Detail
            </Text>
            <View className={`px-3 py-1 ${themeStyles.statusBg} rounded-full`}>
              <Text className={`${themeStyles.statusText} text-sm font-semibold`}>
                {issue?.Status || 'Unknown'}
              </Text>
            </View>
          </View>
          <Text className={`${themeStyles.textMuted} text-sm`}>
            IR Number: <Text className={`${themeStyles.text} font-medium`}>{issue['Sequence No'] || 'N/A'}</Text>
          </Text>
          <Text className={`${themeStyles.textMuted} text-sm`}>
            Created on: <Text className={`${themeStyles.text} font-medium`}>{issue?.created_at?.split(' ')[0] || '-'}</Text>
          </Text>

          {/* Show current approver info for PENDING status */}
          {issue.Status === "PENDING" && (
            <View className={`mt-4 p-4 ${themeStyles.approverBg} rounded-lg ${themeStyles.border} border shadow-sm flex-row items-center`}>
              <FontAwesome 
                name="user-circle" 
                size={24} 
                color={nightMode ? "#60A5FA" : "#074B7C"} 
              />
              <View className="ml-3">
                <Text className={`${themeStyles.textMuted} text-sm`}>Requested Approval To:</Text>
                <Text className={`${nightMode ? 'text-blue-400' : 'text-[#074B7C]'} font-semibold text-base`}>
                  {approver ? approver.Name : "Not Assigned"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Notes Section */}
        {issue?.Notes && (
          <View className={`mb-6 ${themeStyles.border} border rounded-xl p-4 ${themeStyles.cardBg} shadow-sm`}>
            <Text className={`font-semibold ${nightMode ? 'text-blue-400' : 'text-[#074B7C]'}`}>Notes:</Text>
            <Text className={`${themeStyles.textSecondary} text-sm mt-2`}>{issue.Notes}</Text>
          </View>
        )}

        {/* Attachments Section */}
        {issue?.attachments && issue.attachments.length > 0 && (
          <View className="mb-6">
            <SectionTitle 
              icon="paperclip" 
              title="Attachments" 
              nightMode={nightMode}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              {issue.attachments.map((attachment, index) => {
                const isImage = attachment.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                const isPDF = attachment.match(/\.pdf$/i);

                return (
                  <View
                    key={index}
                    style={{
                      flexBasis: '20%',
                      alignItems: 'center',
                      marginVertical: 6,
                      paddingHorizontal: 4,
                    }}
                  >
                    {isImage ? (
                      <TouchableOpacity onPress={() => { setSelectedImage(attachment); setModalVisible(true); }}>
                        <Image
                          source={{ uri: attachment }}
                          style={{ width: 60, height: 60, borderRadius: 6 }}
                        />
                      </TouchableOpacity>
                    ) : isPDF ? (
                      <TouchableOpacity onPress={() => handleDownloadPDF(attachment)}>
                        <View style={{ alignItems: 'center' }}>
                          <FontAwesome name="file-pdf-o" size={32} color="#e53e3e" />
                          <Text
                            style={{ 
                              fontSize: 10, 
                              textAlign: 'center', 
                              marginTop: 2,
                              color: nightMode ? '#D1D5DB' : '#374151'
                            }}
                            numberOfLines={1}
                          >
                            {attachment.split('/').pop()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <Text style={{ 
                        fontSize: 10, 
                        color: nightMode ? '#9CA3AF' : '#888', 
                        textAlign: 'center' 
                      }}>
                        Unsupported File
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Summary Info Cards */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <InfoBox 
            label="Total Quantity" 
            value={issue["Total Quantity"]?.toString() || "0"} 
            icon="sort-numeric-asc" 
            nightMode={nightMode}
            themeStyles={themeStyles}
          />
          <InfoBox 
            label="Total Item" 
            value={issue['Total Item'] || "Unknown"} 
            icon="circle" 
            nightMode={nightMode}
            themeStyles={themeStyles}
          />
          <InfoBox 
            label="Total Price" 
            value={issue["Total Price"]} 
            icon="tag" 
            nightMode={nightMode}
            themeStyles={themeStyles}
          />
          <InfoBox 
            label="Total Tax" 
            value={issue["Total Tax"]} 
            icon="percent" 
            nightMode={nightMode}
            themeStyles={themeStyles}
          />
          <InfoBox 
            label="Total Amount" 
            value={issue["Total Amount"]} 
            icon="money" 
            nightMode={nightMode}
            themeStyles={themeStyles}
          />
        </View>

        {/* Item Details */}
        <View className="mb-6">
          <SectionTitle 
            icon="cube" 
            title="Item Details" 
            nightMode={nightMode}
          />
          {items.length === 0 ? (
            <Text className={`${themeStyles.textMuted} text-sm mt-2`}>No items available.</Text>
          ) : (
            items.map((it, index) => (
              <View
                key={index}
                className={`mt-4 ${themeStyles.border} border rounded-2xl p-4 ${themeStyles.cardBg} shadow-sm`}
              >
                <Text className={`font-bold ${nightMode ? 'text-blue-400' : 'text-[#074B7C]'} text-base mb-3`}>
                  {it.Name || `Item ${index + 1}`}
                </Text>

                <View className="flex-row justify-between mb-2">
                  <ItemInfo 
                    label="Quantity" 
                    value={it.Quantity?.toString() || "-"} 
                    nightMode={nightMode}
                    themeStyles={themeStyles}
                  />
                  <ItemInfo 
                    align={"right"} 
                    label="Tax" 
                    value={getTaxRateByUUID(it.Tax) + "%"} 
                    nightMode={nightMode}
                    themeStyles={themeStyles}
                  />
                </View>

                <View className="flex-row justify-between mb-2">
                  <ItemInfo 
                    label="Price" 
                    value={formatCurrency(it.Price)} 
                    nightMode={nightMode}
                    themeStyles={themeStyles}
                  />
                  <ItemInfo 
                    align={"right"} 
                    label="Total Price" 
                    value={it["Total Price"]} 
                    nightMode={nightMode}
                    themeStyles={themeStyles}
                  />
                </View>

                <View className="flex-row justify-between">
                  <ItemInfo 
                    label="Amount" 
                    value={it.Amount} 
                    nightMode={nightMode}
                    themeStyles={themeStyles}
                  />
                  <ItemInfo 
                    align={"right"} 
                    label="Total Amount" 
                    value={(parseFloat(it["Total Price"] * it.Quantity).toFixed(2))} 
                    nightMode={nightMode}
                    themeStyles={themeStyles}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Request Approval Button */}
      <View className="absolute bottom-1 left-4 right-4">
        <TouchableOpacity
          onPress={handleRequestApprovalPress}
          disabled={issue.Status !== "DRAFT" || isLoading}
          className={`rounded-xl ${
            issue.Status !== "DRAFT" 
              ? (nightMode ? "bg-gray-600" : "bg-gray-300")
              : (nightMode ? "bg-blue-600" : "bg-[#074B7C]")
          }`}
          activeOpacity={issue.Status !== "DRAFT" ? 1 : 0.7}
        >
          <View className="py-4">
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className={`text-center font-semibold text-base ${
                issue.Status !== "DRAFT" 
                  ? (nightMode ? "text-gray-400" : "text-gray-500")
                  : "text-white"
              }`}>
                {issue.Status === "DRAFT" ? "Request Approval" : "Requested"}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Approval Selection Modal */}
      <ApprovalSelectionModal
        visible={approvalModalVisible}
        onClose={() => setApprovalModalVisible(false)}
        approvers={approvalList}
        selectedApprover={selectedApprover}
        setSelectedApprover={setSelectedApprover}
        onProceed={handleFinalApproval}
        loading={isLoading}
      />

      {/* Dynamic Popup */}
      <DynamicPopup
        visible={popupVisible}
        type={popupType}
        message={popupMessage}
        onClose={() => setPopupVisible(false)}
        onOk={handlePopupClose}
      />

      {modalVisible && (
        <ImageViewing
          images={[{ uri: selectedImage }]}
          imageIndex={0}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
};

const InfoBox = ({ label, value, icon, color = "#1E293B", nightMode, themeStyles }) => (
  <View className={`w-[48%] ${themeStyles.infoBg} ${themeStyles.border} border rounded-xl px-4 py-5 mb-3`}>
    <View className="flex-row items-center mb-2">
      <FontAwesome 
        name={icon} 
        size={16} 
        color={nightMode ? "#9CA3AF" : "#64748B"} 
      />
      <Text className={`ml-2 text-sm ${themeStyles.textMuted}`}>{label}</Text>
    </View>
    <Text 
      className="text-lg font-bold" 
      style={{ color: nightMode ? "#F3F4F6" : color }}
    >
      {value}
    </Text>
  </View>
);

const SectionTitle = ({ title, icon, nightMode }) => (
  <View className="flex-row items-center">
    <FontAwesome 
      name={icon} 
      size={18} 
      color={nightMode ? "#60A5FA" : "#1996D3"} 
    />
    <Text className={`ml-2 text-lg font-semibold ${nightMode ? 'text-blue-400' : 'text-[#1996D3]'}`}>
      {title}
    </Text>
  </View>
);

const ItemInfo = ({ label, value, align, nightMode, themeStyles }) => (
  <View style={{ alignItems: align === "right" ? "flex-end" : "flex-start" }}>
    <Text className={`${themeStyles.textMuted} text-xs`}>{label}</Text>
    <Text className={`${themeStyles.textSecondary} font-medium text-base`}>{value}</Text>
  </View>
);

const formatCurrency = (val) => {
  if (!val && val !== 0) return "-";
  return `₹ ${parseFloat(val).toFixed(2)}`;
};

export default IRDetailScreen;