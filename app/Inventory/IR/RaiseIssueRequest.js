import  { useEffect, useState, useCallback, useMemo, useRef } from "react";
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

const styles = {
  assetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  loadingIndicator: {
    marginVertical: 15,
  },
  noDataText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    padding: 15,
  },
};

// Category icon mapping with default fallback
const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || '';
  console.log(categoryName, 'this are names');

  if (name.includes('electrical')) {
    return 'bolt';
  } else if (name.includes('stationery')) {
    return 'pencil';
  } else if (name.includes('housekeeping') || name.includes('home')) {
    return 'home';
    } else if (name.includes('mechanical') || name.includes('home')) {
    return 'cogs';
  } else if (name.includes('general')) {
    return 'list';
  } else if (name.includes('it equipment') || name.includes('it equipments')) {
    return 'laptop';
  } else if (name.includes('furniture')) {
    return 'bed';
  } else if (name.includes('plumbing material')) {
    return 'tint';
  }

  // Fallback icon
  return 'cube';
};


const CreateIRScreen = ({ route }) => {
  const [data, setData] = useState([]);
  const [taxData, setTaxData] = useState([]);
  const [userid, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [invLoading, setInvLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const uuid = route?.params?.uuid || null;
  const [irResponse, setIrResponse] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [note, setNote] = useState("");
  const scrollViewRef = useRef(null);
  const [popup, setPopup] = useState({
    visible: false,
    type: "success",
    message: "",
  });

  // Category selection states
  const [showOptions, setShowOptions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [allCategories, setAllCategories] = useState([]);

  const [items, setItems] = useState([
    { id: Date.now(), item: null, quantity: "", isDropdownOpen: false, search: "" },
  ]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const navigation = useNavigation();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setInvLoading(true);
      const userInfo = await AsyncStorage.getItem("userInfo");
      const parsedUserInfo = JSON.parse(userInfo);
      const userId = parsedUserInfo.data.id;
      setUserId(userId);
      
      if (!userInfo) throw new Error("User information not found in AsyncStorage");

      // Pass null when no category is selected, or the category UUID
      const categoryUuid = selectedCategory?.uuid || null;
      const response = await InventoryServices.getAllIssueItems(uuid, categoryUuid);
      const taxResponse = await InventoryServices.getAllTaxes(uuid);
      
      // Pre-process and optimize the data
      const processedData = response?.data?.map(item => ({
        ...item,
        searchText: (item.item?.["Name"] || "") + (item.item?.["Sequence No"] || "")
      }));
      
      setData(processedData || []);
      setTaxData(taxResponse?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error.message || error);
      setData([]);
      setTaxData([]);
    } finally {
      setLoading(false);
      setInvLoading(false);
    }
  }, [uuid, selectedCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoryLoading(true);
      const response = await InventoryServices.getAllCategories();
      console.log(response.data,'this is categroy data')
      // Process categories with icons
      const processedCategories = response?.data?.map(category => ({
        ...category,
        icon: getCategoryIcon(category.Name),
        label: category.Name,
        value: category.uuid
      })) || [];
      
      setAllCategories(processedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error.message || error);
      setAllCategories([]);
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [fetchData, fetchCategories]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setShowOptions(false);
    setSearchText("");
  }, []);

  // Filter categories based on search text
  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) return allCategories;
    const lowerSearch = searchText.toLowerCase();
    return allCategories.filter(category =>
      category.Name?.toLowerCase().includes(lowerSearch)
    );
  }, [allCategories, searchText]);

  const getTaxRateByUUID = useCallback((uuid) => {
    const tax = taxData?.find((t) => t.uuid === uuid);
    return tax ? tax.Rate : 0;
  }, [taxData]);

  const handleAddItem = useCallback(() => {
    setItems(prevItems => [
      ...prevItems,
      {
        id: Date.now(),
        item: null,
        quantity: "",
        isDropdownOpen: false,
        search: "",
      },
    ]);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleRemoveItem = useCallback((id) => {
    if (items.length === 1) return;
    setItems(prevItems => prevItems.filter((entry) => entry.id !== id));
  }, [items.length]);

  const handleUpdate = useCallback((index, key, value) => {
    setItems(prevItems => {
      const updated = [...prevItems];
      if (updated[index]) {
        updated[index][key] = value;
      }
      return updated;
    });
  }, []);

  const toggleDropdown = useCallback((index) => {
    setItems(prevItems => {
      const updated = [...prevItems];
      updated.forEach((item, i) => {
        if (i !== index) {
          updated[i].isDropdownOpen = false;
        }
      });
      if (updated[index]) {
        updated[index].isDropdownOpen = !updated[index].isDropdownOpen;
      }
      return updated;
    });
  }, []);

  const selectItem = useCallback((index, item) => {
    setItems(prevItems => {
      const updated = [...prevItems];
      if (updated[index]) {
        updated[index].item = item;
        updated[index].isDropdownOpen = false;
        updated[index].search = item?.item?.["Name"] || "";

        if (!updated[index].quantity || parseInt(updated[index].quantity) <= 0) {
          updated[index].quantity = "1";
        }
      }
      return updated;
    });
  }, []);

  const filterItems = useCallback((search) => {
    if (!search || search.length === 0) return data;

    const lowerSearch = search.toLowerCase();
    
    return data?.filter((i) => {
      const name = i.item?.["Name"]?.toLowerCase() || "";
      const sequence = i.item?.["Sequence No"]?.toString().toLowerCase() || "";
      return name.includes(lowerSearch) || sequence.includes(lowerSearch);
    }) || [];
  }, [data]);

  // Calculate totals using useMemo to prevent recalculation on every render
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
        Price: parseFloat(price.toFixed(2)),
        Tax: item?.item?.Tax || "",
        Amount: parseFloat(amount.toFixed(2)),
        "Total Price": parseFloat(total.toFixed(2)),
        stock_before: item?.stock?.[0]?.Stock || 0,
        stock_after: (item?.stock?.[0]?.Stock || 0) - quantity,
      };
    }).filter(item => item.Name); // Filter out items without names

    return {
      totalQuantity,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      itemList
    };
  }, [items, getTaxRateByUUID]);

  // Use memoized header payload
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
    ...(selectedCategory ? { category_id: selectedCategory.value, category_name: selectedCategory.label } : {}),
  }), [totals, uuid, userid, note, attachments, items.length, selectedCategory]);

  const handleSubmit = useCallback(async () => {
    if (items.length === 0) {
      Alert.alert("Error", "Please add at least one item.");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const entry = items[i];
      if (!entry.item || !entry.quantity || parseInt(entry.quantity) <= 0) {
        Alert.alert("Error", `Please fill item and valid quantity for entry ${i + 1}.`);
        return;
      }
    }

    try {
      setLoading(true);
      const response = await CreateIssueRequestApi(headerPayload, totals.itemList);
      setIrResponse(response?.data || {});
      
      if (response?.data) {
        setPopup({
          visible: true,
          type: "success",
          message: "Issue Request created successfully!",
        });
      } else {
        setPopup({
          visible: true,
          type: "error",
          message: "Error while creating Issue Request",
        });
      }
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
  }, [items, headerPayload, totals.itemList]);

  // Check form validity with useMemo
  const isFormValid = useMemo(() => {
    return items.length > 0 && items.every(entry => {
      const quantity = parseInt(entry.quantity) || 0;
      const availableStock = entry.item?.stock?.[0]?.Stock || 0;
      return entry.item && quantity > 0 && quantity <= availableStock;
    });
  }, [items]);

  if (invLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#1996D3" />
        <Text className="mt-3 text-sm text-gray-600 font-medium">Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F8FAFC]"
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
          >
            {/* Category Selection Section */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-800 mb-2">Select Category</Text>
              
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowOptions(!showOptions)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2.5 flex-row justify-between items-center shadow-sm"
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
                      <Text className="text-gray-800 font-medium text-sm">
                        {selectedCategory.label}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Icon 
                        name="cube" 
                        size={16} 
                        color="#9CA3AF" 
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-gray-500 text-sm">Choose category</Text>
                    </>
                  )}
                </View>
                
                {categoryLoading ? (
                  <ActivityIndicator size="small" color="#1996D3" />
                ) : (
                  <Icon
                    name={showOptions ? "chevron-up" : "chevron-down"}
                    size={14}
                    color="#6B7280"
                  />
                )}
              </TouchableOpacity>

              {showOptions && (
                <View className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg" style={{ elevation: 3 }}>
                  {/* Search Input */}
                  <View className="px-3 py-2 border-b border-gray-100">
                    <TextInput
                      className="bg-gray-50 rounded-md px-2 py-1.5 text-gray-800 text-sm"
                      placeholder="Search categories..."
                      value={searchText}
                      onChangeText={setSearchText}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  
                  {/* Categories List */}
                  <ScrollView 
                    nestedScrollEnabled={true} 
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={true}
                    className="max-h-60"
                  >
                    {filteredCategories?.map((category, index) => (
                      <TouchableOpacity
                        key={category.uuid}
                        onPress={() => handleCategorySelect(category)}
                        className={`flex-row items-center px-3 py-2.5 ${
                          index !== filteredCategories.length - 1 ? 'border-b border-gray-100' : ''
                        } ${selectedCategory?.uuid === category.uuid ? 'bg-blue-50' : ''}`}
                        activeOpacity={0.7}
                      >
                        <View className={`w-7 h-7 rounded-full items-center justify-center mr-2.5 ${
                          selectedCategory?.uuid === category.uuid ? 'bg-[#1996D3]' : 'bg-gray-100'
                        }`}>
                          <Icon
                            name={category.icon}
                            size={14}
                            color={selectedCategory?.uuid === category.uuid ? "#FFFFFF" : "#6B7280"}
                          />
                        </View>
                        <Text className={`text-sm font-medium flex-1 ${
                          selectedCategory?.uuid === category.uuid ? 'text-[#1996D3]' : 'text-gray-800'
                        }`}>
                          {category.Name}
                        </Text>
                        {selectedCategory?.uuid === category.uuid && (
                          <View className="ml-auto">
                            <Icon name="check" size={12} color="#1996D3" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                    
                    {filteredCategories.length === 0 && (
                      <View className="px-3 py-4">
                        <Text className="text-center text-gray-500 text-sm">No categories found</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* File Input Component */}
            <View className="mb-4 relative">
              <FileInputComponent 
                setAttachments={setAttachments} 
                attachments={attachments} 
                setNote={setNote} 
                setLoading={setLoading}
                disabled={!selectedCategory}
              />
            </View>

            {/* Items Section */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-800 mb-2">Items</Text>
              
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
                />
              ))}

              <TouchableOpacity
                onPress={handleAddItem}
                className="flex-row items-center justify-center bg-[#1996D3] px-4 py-2.5 rounded-lg shadow-lg mt-3"
                style={{ elevation: 3 }}
                activeOpacity={0.8}
              >
                <Icon name="plus" size={16} color="#FFFFFF" />
                <Text className="text-white font-semibold text-sm ml-2">Add Item</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {!isKeyboardVisible && (
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!isFormValid || loading}
                className={`rounded-lg py-3 px-4 ${
                  isFormValid && !loading ? "bg-[#1996D3]" : "bg-gray-300"
                }`}
                style={{ elevation: isFormValid && !loading ? 3 : 0 }}
                activeOpacity={0.8}
              >
                <Text className={`text-center font-semibold text-sm ${
                  isFormValid && !loading ? "text-white" : "text-gray-500"
                }`}>
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
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default CreateIRScreen;