import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import RequestForApprovalApi from "../../../service/Inventory/RequestForApprovalApi";
import DynamicPopup from "../../DynamivPopUps/DynapicPopUpScreen"; // Corrected import path
import GetTaxesForItems from "../../../service/Inventory/GetTaxesForItems";
import { useFocusEffect } from "@react-navigation/native";
import { GetAllIssueItems } from "../../../service/Inventory/GetAllissues";
import { GetIssueInfo } from "../../../service/Inventory/GetIssueInfo";
import * as FileSystem from 'expo-file-system'; // For downloading files
import ImageViewing from "react-native-image-viewing";
import Loader from "../../LoadingScreen/AnimatedLoader"
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
 const [selectedImage,setSelectedImage]  =useState('')
 const [loading,setLoading] = useState(false)

  const fetchItemInfo = async () => {
    setLoading(true);
    try {
      const response = await GetIssueInfo(issueUuid);
      const allData = response.data;
      setFullData(allData);
      setIssue(allData[0]?.issue || []);
      setItems(allData[0]?.item || []);
    } catch (error) {
      console.error("Error fetching data:", error.message || error);
    }finally{
      setLoading(false)

    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchItemInfo();
    }, [])
  );

  const fetchData = async () => {
    try {
      const taxResponse = await GetTaxesForItems(uuid);
      setTaxData(taxResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error.message || error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTaxRateByUUID = (uuid) => {
    const tax = taxData.find((t) => t.uuid === uuid);
    return tax ? tax.Rate : 0;
  };

  const handleRequestApproval = async () => {
    try {
      setIsLoading(true);
      const response = await RequestForApprovalApi(fullData[0]);
      // More robust response handling
      if (response && response.message === "Updated Successfully") {
        setPopupType("success");
        setPopupMessage("Request Submitted Successfully!");
      } else {
        setPopupType("error");
        setPopupMessage(response?.message || "Request Submitted Unsuccessfully!");
      }
    } catch (error) {
      console.error('Error updating status:', error.message || error);
      setPopupType("error");
      setPopupMessage("Failed to update the status. Please try again.");
    } finally {
      setIsLoading(false);
      setPopupVisible(true);
    }
  };

  const handlePopupClose = () => {
    setPopupVisible(false);
    navigation.navigate("IssuedRequests", { uuid: uuid });
  };
 
  if(loading){
  return  <Loader  />
  }

  return (
    <View className="flex-1 bg-white pb-32">
      <ScrollView className="px-4" style={{ paddingBottom: 200 }}>
        {/* Header */}
        <View className="mb-6 border-b border-gray-200 pb-4">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-2xl font-bold text-[#074B7C]">Issue Request Detail</Text>
            <View className="px-3 py-1 bg-[#E0F2FE] rounded-full">
              <Text className="text-[#0284C7] text-sm font-semibold">{issue?.Status || "Unknown"}</Text>
            </View>
          </View>
          <Text className="text-gray-400 text-sm">
            IR Number: <Text className="text-black font-medium">{issue["Sequence No"] || "N/A"}</Text>
          </Text>
          <Text className="text-gray-400 text-sm">
            Created on: <Text className="text-black font-medium">{issue?.created_at?.split(" ")[0] || "-"}</Text>
          </Text>
        </View>

        {/* Notes Section */}
        {issue?.Notes && (
          <View className="mb-6 border border-gray-200 rounded-xl p-4 bg-[#F9FAFB] shadow-sm">
            <Text className="font-semibold text-[#074B7C]">Notes:</Text>
            <Text className="text-gray-800 text-sm mt-2">{issue.Notes}</Text>
          </View>
        )}

        {/* Attachments Section */}
        {issue?.attachments && issue.attachments.length > 0 && (
  <View className="mb-6">
    <SectionTitle icon="paperclip" title="Attachments" />
    <View className="flex-row flex-wrap justify-start">
      {issue.attachments.map((attachment, index) => {
        const isImage = attachment.match(/\.(jpg|jpeg|png|gif)$/i);
        return (
          <View
            key={index}
            className="mt-4"
            style={{
              width: '33%', // Default for 3 items per row
              minWidth: '25%', // Min width per item
              maxWidth: '40%', // Max width per item
              paddingHorizontal: 4, // Optional padding between images
            }}
          >
            {isImage ? (
              <TouchableOpacity onPress={() => { setSelectedImage(attachment); setModalVisible(true); }}>
                <Image
                  source={{ uri: attachment }}
                  style={{ width: '100%', height: 100, borderRadius: 8 }}
                />
              </TouchableOpacity>
            ) : (
              <Text className="text-gray-500">File: {attachment}</Text>
            )}
          </View>
        );
      })}
    </View>
  </View>

        )}

        {/* Summary Info Cards */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <InfoBox label="Total Quantity" value={issue["Total Quantity"]?.toString() || "0"} icon="sort-numeric-asc" />
          <InfoBox label="Total Item" value={issue['Total Item'] || "Unknown"} icon="circle" />
          <InfoBox label="Total Price" value={formatCurrency(issue["Total Price"])} icon="tag" />
          <InfoBox label="Total Tax" value={formatCurrency(issue["Total Tax"])} icon="percent" />
          <InfoBox label="Total Amount" value={formatCurrency(issue["Total Amount"])} icon="money" />
        </View>

        {/* Item Details */}
        <View className="mb-6">
          <SectionTitle icon="cube" title="Item Details" />
          {items.length === 0 ? (
            <Text className="text-gray-500 text-sm mt-2">No items available.</Text>
          ) : (
            items.map((it, index) => (
              <View
                key={index}
                className="mt-4 border border-gray-200 rounded-2xl p-4 bg-[#F9FAFB] shadow-sm"
              >
                <Text className="font-bold text-[#074B7C] text-base mb-3">
                  {it.Name || `Item ${index + 1}`}
                </Text>

                <View className="flex-row justify-between mb-2">
                  <ItemInfo label="Quantity" value={it.Quantity?.toString() || "-"} />
                  <ItemInfo align={"right"} label="Tax" value={getTaxRateByUUID(it.Tax) + "%"} />
                </View>

                <View className="flex-row justify-between mb-2">
                  <ItemInfo label="Price" value={formatCurrency(it.Price)} />
                  <ItemInfo align={"right"} label="Total Price" value={it.TotalPrice} />
                </View>

                <View className="flex-row justify-between">
                  <ItemInfo label="Amount" value={it.Amount} />
                  <ItemInfo align={"right"} label="Total Amount" value={(parseFloat(it.TotalPrice * it.Quantity).toFixed(2))} />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Request Approval Button */}
      <View className="absolute bottom-16 left-4 right-4">
        <TouchableOpacity
          onPress={handleRequestApproval}
          disabled={issue.Status !== "DRAFT" || isLoading}
          className={`rounded-xl ${issue.Status !== "DRAFT" ? "bg-gray-300" : "bg-[#074B7C]"}`}
          activeOpacity={issue.Status !== "DRAFT" ? 1 : 0.7}
        >
          <View className="py-4">
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className={`text-center font-semibold text-base ${issue.Status !== "DRAFT" ? "text-gray-500" : "text-white"}`}>
                {issue.Status === "DRAFT" ? "Request Approval" : "Requested"}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

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
          images={[{ uri:selectedImage  }]}
          imageIndex={0}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
};

const InfoBox = ({ label, value, icon, color = "#1E293B" }) => (
  <View className="w-[48%] bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-5 mb-3">
    <View className="flex-row items-center mb-2">
      <FontAwesome name={icon} size={16} color="#64748B" />
      <Text className="ml-2 text-sm text-gray-500">{label}</Text>
    </View>
    <Text className="text-lg font-bold" style={{ color }}>{value}</Text>
  </View>
);

const SectionTitle = ({ title, icon }) => (
  <View className="flex-row items-center">
    <FontAwesome name={icon} size={18} color="#1996D3" />
    <Text className="ml-2 text-lg font-semibold text-[#1996D3]">{title}</Text>
  </View>
);

const ItemInfo = ({ label, value, align }) => (
  <View style={{ alignItems: align === "right" ? "flex-end" : "flex-start" }}>
    <Text className="text-gray-400 text-xs">{label}</Text>
    <Text className="text-gray-800 font-medium text-base">{value}</Text>
  </View>
);

const formatCurrency = (val) => {
  if (!val && val !== 0) return "-";
  return `₹ ${parseFloat(val).toFixed(2)}`;
};

export default IRDetailScreen;
