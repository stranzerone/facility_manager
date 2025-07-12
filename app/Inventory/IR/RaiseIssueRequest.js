import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { CreateIssueRequestApi } from "../../../service/Inventory/CreateIssueRequestApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DynamicPopup from "../../DynamivPopUps/DynapicPopUpScreen";
import { useNavigation } from "@react-navigation/native";
import FileInputComponent from "./TextAndFileInput";
import ItemEntry from "./ItemInputCard";
import { InventoryServices } from "../../../services/apis/InventoryApi";
import { usePermissions } from "../../GlobalVariables/PermissionsContext";

// Optimized styles with night mode support
const getStyles = (nightMode) => ({
  container: nightMode ? 'flex-1 bg-gray-900' : 'flex-1 bg-[#F8FAFC]',
  loadingContainer: nightMode ? 'flex-1 justify-center items-center bg-gray-900' : 'flex-1 justify-center items-center bg-[#F8FAFC]',
  loadingText: nightMode ? 'mt-3 text-sm text-gray-300 font-medium' : 'mt-3 text-sm text-gray-600 font-medium',
  sectionTitle: nightMode ? 'text-base font-semibold text-gray-100 mb-2' : 'text-base font-semibold text-gray-800 mb-2',
  categoryButton: nightMode 
    ? 'bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 flex-row justify-between items-center shadow-sm'
    : 'bg-white border border-gray-300 rounded-lg px-3 py-2.5 flex-row justify-between items-center shadow-sm',
  categoryButtonText: nightMode ? 'text-gray-100 font-medium text-sm' : 'text-gray-800 font-medium text-sm',
  placeholderText: nightMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm',
  dropdown: nightMode 
    ? 'mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg'
    : 'mt-1 bg-white border border-gray-200 rounded-lg shadow-lg',
  searchInput: nightMode 
    ? 'bg-gray-700 rounded-md px-2 py-1.5 text-gray-100 text-sm'
    : 'bg-gray-50 rounded-md px-2 py-1.5 text-gray-800 text-sm',
  searchInputBorder: nightMode ? 'px-3 py-2 border-b border-gray-600' : 'px-3 py-2 border-b border-gray-100',
  categoryItem: nightMode ? 'border-b border-gray-600' : 'border-b border-gray-100',
  categoryItemSelected: nightMode ? 'bg-blue-900' : 'bg-blue-50',
  categoryItemText: nightMode ? 'text-sm font-medium flex-1 text-gray-100' : 'text-sm font-medium flex-1 text-gray-800',
  categoryItemTextSelected: nightMode ? 'text-sm font-medium flex-1 text-blue-300' : 'text-sm font-medium flex-1 text-[#1996D3]',
  noDataText: nightMode ? 'text-center text-gray-400 text-sm' : 'text-center text-gray-500 text-sm',
  addButton: 'flex-row items-center justify-center bg-[#1996D3] px-4 py-2.5 rounded-lg shadow-lg mt-3',
  bottomContainer: nightMode 
    ? 'absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-600 p-3'
    : 'absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3',
  submitButton: (isValid, loading) => isValid && !loading ? "bg-[#1996D3]" : (nightMode ? "bg-gray-600" : "bg-gray-300"),
  submitButtonText: (isValid, loading) => isValid && !loading ? "text-white" : (nightMode ? "text-gray-400" : "text-gray-500"),
});

// Category icon mapping with default fallback
const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || '';
  
  if (name.includes('electrical')) return 'bolt';
  if (name.includes('stationery')) return 'pencil';
  if (name.includes('housekeeping') || name.includes('home')) return 'home';
  if (name.includes('mechanical')) return 'cogs';
  if (name.includes('general')) return 'list';
  if (name.includes('it equipment') || name.includes('it equipments')) return 'laptop';
  if (name.includes('furniture')) return 'bed';
  if (name.includes('plumbing material')) return 'tint';
  
  return 'cube';
};

const CreateIRScreen = ({ route }) => {
  // State management
  const [data, setData] = useState([]);
  const [taxData, setTaxData] = useState([]);
  const [userid, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [invLoading, setInvLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [note, setNote] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  // Category selection states
  const [showOptions, setShowOptions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  
  // Items state
  const [items, setItems] = useState([
    { id: Date.now(), item: null, quantity: "", isDropdownOpen: false, search: "" },
  ]);
  
  // Popup state
  const [popup, setPopup] = useState({
    visible: false,
    type: "success",
    message: "",
  });
  const [irResponse, setIrResponse] = useState({});
  
  // Refs and hooks
  const scrollViewRef = useRef(null);
  const navigation = useNavigation();
  const { nightMode } = usePermissions();
  const uuid = route?.params?.uuid || null;
  
  // Get styles based on night mode
  const styles = useMemo(() => getStyles(nightMode), [nightMode]);

  // Optimized data fetching with error boundaries
  const fetchData = useCallback(async () => {
    if (invLoading) return; // Prevent multiple simultaneous calls
    
    try {
      setLoading(true);
      setInvLoading(true);
      
      const userInfo = await AsyncStorage.getItem("userInfo");
      if (!userInfo) throw new Error("User information not found");
      
      const parsedUserInfo = JSON.parse(userInfo);
      const userId = parsedUserInfo?.data?.id;
      if (!userId) throw new Error("Invalid user data");
      
      setUserId(userId);
      
      // Parallel API calls for better performance
      const categoryUuid = selectedCategory?.uuid || null;
      const [itemsResponse, taxResponse] = await Promise.all([
        InventoryServices.getAllIssueItems(uuid, categoryUuid),
        InventoryServices.getAllTaxes(uuid)
      ]);
      
      // Optimize data processing
      const processedData = itemsResponse?.data?.map(item => ({
        ...item,
        searchText: `${item.item?.["Name"] || ""} ${item.item?.["Sequence No"] || ""}`.toLowerCase()
      })) || [];
      
      setData(processedData);
      setTaxData(taxResponse?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error.message || error);
      setData([]);
      setTaxData([]);
      // Could add user notification here
    } finally {
      setLoading(false);
      setInvLoading(false);
    }
  }, [uuid, selectedCategory, invLoading]);

  // Optimized category fetching
  const fetchCategories = useCallback(async () => {
    if (categoryLoading) return;
    
    try {
      setCategoryLoading(true);
      const response = await InventoryServices.getAllCategories();
      
      const processedCategories = response?.data?.map(category => ({
        ...category,
        icon: getCategoryIcon(category.Name),
        label: category.Name,
        value: category.uuid,
        searchKey: category.Name?.toLowerCase() || ''
      })) || [];
      
      setAllCategories(processedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error.message || error);
      setAllCategories([]);
    } finally {
      setCategoryLoading(false);
    }
  }, [categoryLoading]);

  // Effects with cleanup
  useEffect(() => {
    fetchData();
  }, [selectedCategory]); // Only re-fetch when category changes

  useEffect(() => {
    fetchCategories();
  }, []); // Fetch categories only once

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Optimized handlers with proper memoization
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setShowOptions(false);
    setSearchText("");
  }, []);

  // Optimized filtering with debouncing effect
  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) return allCategories;
    const lowerSearch = searchText.toLowerCase();
    return allCategories.filter(category =>
      category.searchKey.includes(lowerSearch)
    );
  }, [allCategories, searchText]);

  const getTaxRateByUUID = useCallback((uuid) => {
    const tax = taxData?.find((t) => t.uuid === uuid);
    return tax ? tax.Rate : 0;
  }, [taxData]);

  // Optimized item management
  const handleAddItem = useCallback(() => {
    const newItem = {
      id: Date.now() + Math.random(), // Ensure uniqueness
      item: null,
      quantity: "",
      isDropdownOpen: false,
      search: "",
    };
    
    setItems(prevItems => [...prevItems, newItem]);

    // Optimized scrolling
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const handleRemoveItem = useCallback((id) => {
    if (items.length <= 1) return;
    setItems(prevItems => prevItems.filter((entry) => entry.id !== id));
  }, [items.length]);

  const handleUpdate = useCallback((index, key, value) => {
    setItems(prevItems => {
      const updated = [...prevItems];
      if (updated[index]) {
        updated[index] = { ...updated[index], [key]: value };
      }
      return updated;
    });
  }, []);

  const toggleDropdown = useCallback((index) => {
    setItems(prevItems => {
      const updated = prevItems.map((item, i) => ({
        ...item,
        isDropdownOpen: i === index ? !item.isDropdownOpen : false
      }));
      return updated;
    });
  }, []);

  const selectItem = useCallback((index, item) => {
    setItems(prevItems => {
      const updated = [...prevItems];
      if (updated[index]) {
        const quantity = !updated[index].quantity || parseInt(updated[index].quantity) <= 0 ? "1" : updated[index].quantity;
        updated[index] = {
          ...updated[index],
          item: item,
          isDropdownOpen: false,
          search: item?.item?.["Name"] || "",
          quantity: quantity
        };
      }
      return updated;
    });
  }, []);

  // Optimized filtering function
  const filterItems = useCallback((search) => {
    if (!search?.trim()) return data;
    const lowerSearch = search.toLowerCase();
    return data?.filter((item) => item.searchText?.includes(lowerSearch)) || [];
  }, [data]);

  // Memoized calculations for better performance
  const totals = useMemo(() => {
    let totalQuantity = 0;
    let totalPrice = 0;
    let totalTax = 0;
    let totalAmount = 0;

    const itemList = items?.map((entry) => {
      const item = entry.item;
      const quantity = parseInt(entry.quantity) || 0;
      const price = parseFloat(item?.item?.["Purchase Price"] || 0);
      const taxRate = getTaxRateByUUID(item?.item?.Tax);
      const amount = price * quantity;
      const tax = (amount * taxRate) / 100;
      const total = amount + tax;

      totalQuantity += quantity;
      totalPrice += amount;
      totalTax += tax;
      totalAmount += total;
      
      return {
        Name: item?.item?.["Name"] || "",
        item_id: item?.item?.uuid || "",
        item_uuid: item?.item?.uuid || "",
        Quantity: quantity,
        Price: Number(price.toFixed(2)),
        Tax: item?.item?.Tax || "",
        Amount: Number(amount.toFixed(2)),
        "Total Price": Number(total.toFixed(2)),
        stock_before: item?.stock?.[0]?.Stock || 0,
        stock_after: (item?.stock?.[0]?.Stock || 0) - quantity,
      };
    }).filter(item => item.Name);

    return {
      totalQuantity,
      totalPrice: Number(totalPrice.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      itemList
    };
  }, [items, getTaxRateByUUID]);

  // Memoized header payload
  const headerPayload = useMemo(() => ({
    Date: new Date().toISOString().split("T")[0],
    Status: "DRAFT",
    Unit_No: "",
    created_by: userid,
    warehouse_id: uuid,
    "Total Quantity": totals.totalQuantity,
    "Total Item": items.length,
    "Total Price": totals.totalPrice,
    "Total Tax": totals.totalTax || "0.00",
    "Total Amount": totals.totalAmount,
    ...(note ? { Notes: note } : {}),
    ...(attachments.length > 0 ? { attachments: attachments } : {}),
    ...(selectedCategory ? { 
      category_id: selectedCategory.value, 
      category_name: selectedCategory.label 
    } : {}),
  }), [totals, uuid, userid, note, attachments, items.length, selectedCategory]);

  // Optimized form validation
  const isFormValid = useMemo(() => {
    return items.length > 0 && items.every(entry => {
      const quantity = parseInt(entry.quantity) || 0;
      const availableStock = entry.item?.stock?.[0]?.Stock || 0;
      return entry.item && quantity > 0 && quantity <= availableStock;
    });
  }, [items]);

  // Optimized submit handler
  const handleSubmit = useCallback(async () => {
    if (loading) return; // Prevent double submission
    
    if (items.length === 0) {
      Alert.alert("Error", "Please add at least one item.");
      return;
    }

    // Validate all items
    for (let i = 0; i < items.length; i++) {
      const entry = items[i];
      const quantity = parseInt(entry.quantity) || 0;
      if (!entry.item || quantity <= 0) {
        Alert.alert("Error", `Please fill item and valid quantity for entry ${i + 1}.`);
        return;
      }
    }

    try {
      setLoading(true);
      const response = await InventoryServices.createIssueRequest(headerPayload, totals.itemList);
      setIrResponse(response?.data || {});
      
      setPopup({
        visible: true,
        type: response?.data ? "success" : "error",
        message: response?.data 
          ? "Issue Request created successfully!" 
          : "Error while creating Issue Request",
      });
    } catch (error) {
      console.error("Submission Error:", error.message || error);
      setPopup({
        visible: true,
        type: "error",
        message: "Failed to submit Issue Request.",
      });
    } finally {
      setLoading(false);
    }
  }, [items, headerPayload, totals.itemList, loading]);

  // Loading screen with night mode
  if (invLoading) {
    return (
      <View className={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1996D3" />
        <Text className={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 py-3">
          <ScrollView
            ref={scrollViewRef}
            className="p-3"
            contentContainerStyle={{ paddingBottom: 130 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={8}
            getItemLayout={null}
            scrollEventThrottle={16}
          >
            {/* Category Selection Section */}
    {  false &&      <View className="mb-4">
              <Text className={styles.sectionTitle}>Select Category</Text>
              
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowOptions(!showOptions)}
                className={styles.categoryButton}
                style={{ elevation: 1 }}
              >
                <View className="flex-row items-center flex-1">
                  {selectedCategory ? (
                    <>
                      <Icon 
                        name={selectedCategory.icon} 
                        size={16} 
                        color="#1996D3" 
                        style={{ marginRight: 8 }}
                      />
                      <Text className={styles.categoryButtonText}>
                        {selectedCategory.label}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Icon 
                        name="cube" 
                        size={16} 
                        color={nightMode ? "#9CA3AF" : "#9CA3AF"} 
                        style={{ marginRight: 8 }}
                      />
                      <Text className={styles.placeholderText}>Choose category</Text>
                    </>
                  )}
                </View>
                
                {categoryLoading ? (
                  <ActivityIndicator size="small" color="#1996D3" />
                ) : (
                  <Icon
                    name={showOptions ? "chevron-up" : "chevron-down"}
                    size={14}
                    color={nightMode ? "#9CA3AF" : "#6B7280"}
                  />
                )}
              </TouchableOpacity>

              {showOptions && (
                <View className={styles.dropdown} style={{ elevation: 3 }}>
                  {/* Search Input */}
                  <View className={styles.searchInputBorder}>
                    <TextInput
                      className={styles.searchInput}
                      placeholder="Search categories..."
                      value={searchText}
                      onChangeText={setSearchText}
                      placeholderTextColor={nightMode ? "#9CA3AF" : "#9CA3AF"}
                    />
                  </View>
                  
                  {/* Categories List - Using FlatList for better performance */}
                  <FlatList 
                    data={filteredCategories}
                    keyExtractor={(item) => item.uuid}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={true}
                    style={{ maxHeight: 240 }}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    initialNumToRender={5}
                    renderItem={({ item: category, index }) => (
                      <TouchableOpacity
                        key={category.uuid}
                        onPress={() => handleCategorySelect(category)}
                        className={`flex-row items-center px-3 py-2.5 ${
                          index !== filteredCategories.length - 1 ? styles.categoryItem : ''
                        } ${selectedCategory?.uuid === category.uuid ? styles.categoryItemSelected : ''}`}
                        activeOpacity={0.7}
                      >
                        <View className={`w-7 h-7 rounded-full items-center justify-center mr-2.5 ${
                          selectedCategory?.uuid === category.uuid 
                            ? 'bg-[#1996D3]' 
                            : (nightMode ? 'bg-gray-700' : 'bg-gray-100')
                        }`}>
                          <Icon
                            name={category.icon}
                            size={14}
                            color={selectedCategory?.uuid === category.uuid 
                              ? "#FFFFFF" 
                              : (nightMode ? "#9CA3AF" : "#6B7280")
                            }
                          />
                        </View>
                        <Text className={selectedCategory?.uuid === category.uuid 
                          ? styles.categoryItemTextSelected 
                          : styles.categoryItemText
                        }>
                          {category.Name}
                        </Text>
                        {selectedCategory?.uuid === category.uuid && (
                          <View className="ml-auto">
                            <Icon name="check" size={12} color={nightMode ? "#60A5FA" : "#1996D3"} />
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                      <View className="px-3 py-4">
                        <Text className={styles.noDataText}>No categories found</Text>
                      </View>
                    )}
                  />
                </View>
              )}
            </View>}

            {/* File Input Component */}
            <View className="mb-4 relative">
              <FileInputComponent 
                setAttachments={setAttachments} 
                attachments={attachments} 
                setNote={setNote} 
                setLoading={setLoading}
                disabled={selectedCategory}
                nightMode={nightMode}
              />
            </View>

            {/* Items Section */}
            <View className="mb-4">
              <Text className={styles.sectionTitle}>Items</Text>
              
              {items?.map((entry, index) => (
                <ItemEntry
                  key={entry.id}
                  entry={entry}
                  index={index}
                  handleRemoveItem={handleRemoveItem}
                  toggleDropdown={toggleDropdown}
                  handleUpdate={handleUpdate}
                  selectItem={selectItem}
                  filterItems={filterItems}
                  loading={loading}
                  getTaxRateByUUID={getTaxRateByUUID}
                  items={items}
                  category={selectedCategory?.uuid || null}
                  nightMode={nightMode}
                />
              ))}

              <TouchableOpacity
                onPress={handleAddItem}
                className={styles.addButton}
                style={{ elevation: 3 }}
                activeOpacity={0.8}
              >
                <Icon name="plus" size={16} color="#FFFFFF" />
                <Text className="text-white font-semibold text-sm ml-2">Add Item</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {!isKeyboardVisible && (
            <View className={styles.bottomContainer}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!isFormValid || loading}
                className={`rounded-lg py-3 px-4 ${styles.submitButton(isFormValid, loading)}`}
                style={{ elevation: isFormValid && !loading ? 3 : 0 }}
                activeOpacity={0.8}
              >
                <Text className={`text-center font-semibold text-sm ${styles.submitButtonText(isFormValid, loading)}`}>
                  {loading ? "Creating..." : "Create Issue Request"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
      
      {popup.visible && (
        <DynamicPopup
          onOk={() => {
            setPopup({ ...popup, visible: false });
            if (popup.type === "success") {
              navigation.replace("IrDetail", { 
                item: irResponse, 
                uuid: uuid, 
                issueUuid: irResponse.uuid 
              });
            } else {
              setPopup({
                visible: false,
                type: "success",
                message: "",
              });
            }
          }}
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup({ ...popup, visible: false })}
          nightMode={nightMode}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default CreateIRScreen;