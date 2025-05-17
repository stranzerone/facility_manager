import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import IRCard from "./IRcard"; // adjust path if needed
import { GetAllIssueItems } from "../../../service/Inventory/GetAllissues";
import OptionsModal from "../../DynamivPopUps/DynamicOptionsPopUp"; // adjust path if needed
import { usePermissions } from "../../GlobalVariables/PermissionsContext";
import Loader from "../../LoadingScreen/AnimatedLoader";

const IRItemsScreen = ({ route }) => {
  const navigation = useNavigation();
  const uuid = route?.params?.uuid || null;

  const [irItems, setIrItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const { issueRequestPermission } = usePermissions();
  const permissionToAdd = issueRequestPermission.some((permission) =>
    permission.includes("C")
  );

  const filterByStatus = (items, status) => {
    if (status === "ALL") {
      return items.filter((item) => item && item.issue);
    }
    return items.filter((item) => item && item.issue?.Status === status);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await GetAllIssueItems(uuid);
      const allItems = response.data || [];
      setIrItems(allItems);
      const filtered = filterByStatus(allItems, selectedStatus);
      setFilteredItems(filtered);
    } catch (error) {
      console.error("Error fetching data:", error.message || error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch fresh data every time screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [selectedStatus, uuid])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleFilterChange = (status) => {
    setSelectedStatus(status);
    const filtered = filterByStatus(irItems, status);
    setFilteredItems(filtered);
    setShowOptionsModal(false);
  };

  const statusOptions = [
    { label: "All", value: "ALL", icon: "list" },
    { label: "Pending", value: "PENDING", icon: "clock-o" },
    { label: "Approved", value: "APPROVED", icon: "check" },
    { label: "Declined", value: "DECLINED", icon: "times-circle" },
    { label: "Draft", value: "DRAFT", icon: "file-o" },
    { label: "Cancelled", value: "CANCELLED", icon: "times-circle" },
  ];

  const renderHeader = () => (
    <View className="flex-row items-center justify-between mb-4 pt-1 bg-[#F1F5F9] z-10">
      <View className="flex-row gap-2 items-center justify-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 rounded-full bg-white shadow-sm"
        >
          <FontAwesome name="arrow-left" size={18} color="#074B7C" />
        </TouchableOpacity>
        <Text className="text-black text-xl font-semibold">IR List</Text>
      </View>

      <View className="flex-row items-center justify-center bg-white rounded-full p-2 mt-1">
        <TouchableOpacity
          onPress={() => setShowOptionsModal(true)}
          className="flex-row items-center justify-center"
        >
          <Text className="text-black text-md font-semibold mr-1">
            {selectedStatus}
          </Text>
          <FontAwesome name="filter" size={18} color="#074B7C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleCreateIR = () => {
    navigation.navigate("CreateIssueRequest", { uuid: uuid });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F1F5F9] px-4 pb-32">
      {loading ? (
       <Loader />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) =>
            item && item.issue ? <IRCard item={item} uuid={uuid} /> : null
          }
          ListHeaderComponent={renderHeader}
          stickyHeaderIndices={[0]}
          contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center mt-16 px-6">
              <FontAwesome name="info-circle" size={50} color="#94A3B8" />
              <Text className="text-gray-500 text-lg mt-4 font-medium text-center">
                No Issue Requests Found
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-1">
                Pull down to refresh or try a different filter.
              </Text>
            </View>
          )}
        />
      )}

      {/* Floating Button */}
      <View className="absolute bottom-16 left-4 right-4">
        <TouchableOpacity
          onPress={handleCreateIR}
          disabled={!permissionToAdd}
          className="bg-[#074B7C] py-4 rounded-2xl flex-row items-center justify-center shadow-lg"
        >
          <FontAwesome name="plus" size={16} color="#fff" />
          <Text className="text-white font-semibold ml-2">Create New IR</Text>
        </TouchableOpacity>
      </View>

      {/* Options Modal */}
      <OptionsModal
        visible={showOptionsModal}
        options={statusOptions}
        onSelect={handleFilterChange}
        onClose={() => setShowOptionsModal(false)}
      />
    </SafeAreaView>
  );
};

export default IRItemsScreen;
