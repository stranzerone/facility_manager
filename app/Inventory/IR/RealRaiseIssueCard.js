import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import GetIssueItems from "../../../service/Inventory/GetItemsList";
import { CreateIssueRequestApi } from "../../../service/Inventory/CreateIssueRequestApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GetTaxesForItems from "../../../service/Inventory/GetTaxesForItems";
import DynamicPopup from "../../DynamivPopUps/DynapicPopUpScreen";
import { useNavigation } from "@react-navigation/native";
import FileInputComponent from "./TextAndFileInput";

const CreateIRScreen = ({ route }) => {
  const [data, setData] = useState([]);
  const [taxData, setTaxData] = useState([]);
  const [userid, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const uuid = route?.params?.uuid || null;
  const [irResponse, setIrResponse] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [note, setNote] = useState("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  
  const [popup, setPopup] = useState({
    visible: false,
    type: "success",
    message: "",
  });

  const [items, setItems] = useState([
    { id: Date.now(), item: null, quantity: "", isDropdownOpen: false, search: "" },
  ]);
  
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const navigation = useNavigation();

  // Animation functions
  const animateSlide = (direction) => {
    // Reset the animation
    slideAnimation.setValue(direction === 'right' ? -300 : 300);
    
    // Animate to 0 (center)
    Animated.spring(slideAnimation, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const userInfo = await AsyncStorage.getItem("userInfo");
      const parsedUserInfo = JSON.parse(userInfo);
      const userId = parsedUserInfo.data.id;
      setUserId(userId);
      if (!userInfo) throw new Error("User information not found in AsyncStorage");

      const response = await GetIssueItems(uuid);
      const taxResponse = await GetTaxesForItems(uuid);
      setData(response.data);
      setTaxData(taxResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const getTaxRateByUUID = (uuid) => {
    const tax = taxData?.find((t) => t.uuid === uuid);
    return tax ? tax.Rate : 0;
  };

  const handleAddItem = () => {
    const newItems = [
      ...items,
      {
        id: Date.now(),
        item: null,
        quantity: "",
        isDropdownOpen: false,
        search: "",
      },
    ];
    setItems(newItems);
    setCurrentCardIndex(newItems.length - 1);
    animateSlide('left');
  };

  const handleRemoveItem = (id) => {
    if (items.length === 1) return;
    
    const itemIndex = items.findIndex(item => item.id === id);
    const updated = items.filter((entry) => entry.id !== id);
    setItems(updated);
    
    // Update current index
    if (itemIndex <= currentCardIndex) {
      setCurrentCardIndex(Math.min(currentCardIndex - 1, updated.length - 1));
    }
    
    // Don't animate if we're just removing the current card
    if (updated.length > 0) {
      animateSlide('right');
    }
  };

  const handleUpdate = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = value;
    setItems(updated);
  };

  const toggleDropdown = (index) => {
    const updated = [...items];
    updated[index].isDropdownOpen = !updated[index].isDropdownOpen;
    setItems(updated);
  };

  const selectItem = (index, item) => {
    const updated = [...items];
    updated[index].item = item;
    updated[index].isDropdownOpen = false;
    updated[index].search = item.item["Name"];

    // Set default quantity to 1 if empty or 0
    if (!updated[index].quantity || parseInt(updated[index].quantity) <= 0) {
      updated[index].quantity = "1";
    }

    setItems(updated);
  };

  const filterItems = (search) => {
    if (!search || search.length === 0) return data;

    const lowerSearch = search.toLowerCase();

    return data?.filter((i) => {
      const name = i.item?.["Name"]?.toLowerCase() || "";
      const sequence = i.item?.["Sequence No"]?.toString().toLowerCase() || "";
      return name.includes(lowerSearch) || sequence.includes(lowerSearch);
    });
  };

  // Navigation functions
  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      animateSlide('right');
    }
  };

  const goToNextCard = () => {
    if (currentCardIndex < items.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      animateSlide('left');
    }
  };

  // Calculate totals
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
      Name: item?.item?.["Name"],
      item_id: item?.item?.uuid,
      item_uuid: item?.item?.uuid,
      Quantity: quantity,
      Price: parseFloat(price.toFixed(2)),
      Tax: item?.item?.Tax || "",
      Amount: parseFloat(amount.toFixed(2)),
      TotalPrice: parseFloat(total.toFixed(2)),
      stock_before: item?.item?.["Current Stock"] || 0,
      stock_after: (item?.item?.["Current Stock"] || 0) - quantity,
    };
  });
  
  const headerPayload = {
    Date: new Date().toISOString().split("T")[0],
    Status: "DRAFT",
    Unit_No: "",
    created_by: "",
    Return: 0,
    warehouse_id: uuid,
    "Total Quantity": totalQuantity,
    "Total Item": items.length,
    "Total Price": parseFloat(totalPrice.toFixed(2)),
    "Total Tax": parseFloat(totalTax.toFixed(2)),
    "Total Amount": parseFloat(totalAmount.toFixed(2)),
    Notes: note,
    attachments: attachments
  };

  const handleSubmit = async () => {
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
      const response = await CreateIssueRequestApi(headerPayload, itemList);
      setIrResponse(response.data);
      setPopup({
        visible: true,
        type: "success",
        message: "Issue Request created successfully!",
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
  };

  // Check form validity
  const isFormValid = items.length > 0 && items.every(entry => {
    const quantity = parseInt(entry.quantity) || 0;
    const availableStock = entry.item?.stock?.[0]?.Stock || 0;
    return entry.item && quantity > 0 && quantity <= availableStock;
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F8FAFC]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView className="flex-1">
          <View className="p-4">
            {/* Card Counter and Navigation buttons */}
            <View className="flex-row justify-center items-center my-2">
              <Text className="text-lg font-bold text-gray-700">
                Item {currentCardIndex + 1} of {items.length}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity
                onPress={goToPrevCard}
                disabled={currentCardIndex === 0}
                className={`flex-row items-center ${currentCardIndex === 0 ? 'opacity-50' : ''}`}
              >
                <Icon name="chevron-left" size={20} color="#1996D3" />
                <Text className="text-[#1996D3] font-medium ml-1">Previous</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleAddItem}
                className="flex-row items-center justify-center bg-[#1996D3] px-4 py-2 rounded-full shadow-md"
              >
                <Icon name="plus" size={16} color="#fff" />
                <Text className="text-white font-bold ml-1">Add Item</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={goToNextCard}
                disabled={currentCardIndex === items.length - 1}
                className={`flex-row items-center ${currentCardIndex === items.length - 1 ? 'opacity-50' : ''}`}
              >
                <Text className="text-[#1996D3] font-medium mr-1">Next</Text>
                <Icon name="chevron-right" size={20} color="#1996D3" />
              </TouchableOpacity>
            </View>

            {/* Card Container - Now at top */}
            <View className="relative overflow-hidden mb-4" style={{ minHeight: 380 }}>
              {items.length > 0 && (
                <Animated.View
                  style={{
                    transform: [{ translateX: slideAnimation }],
                  }}
                >
                  {(() => {
                    const entry = items[currentCardIndex];
                    if (!entry) return null;
                    
                    const item = entry.item;
                    const price = parseFloat(item?.item?.["Purchase Price"] || 0);
                    const taxRate = getTaxRateByUUID(item?.item?.Tax || "");
                    const quantity = parseInt(entry.quantity) || 0;
                    const tax = (price * quantity * taxRate) / 100;
                    const amount = price * quantity;
                    const total = amount + tax;
                    const available = entry?.item?.stock?.[0]?.Stock || 0;
                    const isOverQuantity = quantity > available;

                    return (
                      <View
                        key={entry.id}
                        className="bg-white rounded-2xl p-4 mb-2 relative"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.06,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <TouchableOpacity
                          className="absolute top-3 right-3 z-10"
                          onPress={() => handleRemoveItem(entry.id)}
                        >
                          <Icon name="close" size={20} color="#DC2626" />
                        </TouchableOpacity>

                        <Text className="text-sm text-gray-700 mb-1">
                          <Icon name="list" size={14} /> Select Item
                        </Text>
                        <TouchableOpacity
                          activeOpacity={1}
                          onPress={() => toggleDropdown(currentCardIndex)}
                          className="border border-gray-300 rounded-xl px-3 py-2 mb-1 flex-row justify-between items-center"
                        >
                          <TextInput
                            className="text-black flex-1"
                            placeholder={entry.item ? "" : "Choose item"}
                            value={entry.search}
                            onChangeText={(text) => {
                              handleUpdate(currentCardIndex, "search", text);
                              handleUpdate(currentCardIndex, "item", null);
                            }}
                            onFocus={() => handleUpdate(currentCardIndex, "isDropdownOpen", true)}
                          />
                          {loading ? (
                            <Text>Loading..</Text>
                          ) : (
                            <Icon
                              name={entry.isDropdownOpen ? "chevron-up" : "chevron-down"}
                              size={20}
                              color="#999"
                            />
                          )}
                        </TouchableOpacity>

                        {entry.isDropdownOpen && (
                          <View
                            className="border border-gray-300 rounded-xl bg-white mb-3"
                            style={{ maxHeight: 200 }}
                          >
                            <FlatList
                              data={filterItems(entry.search)}
                              keyExtractor={(item, i) => item.item?.uuid || i.toString()}
                              showsVerticalScrollIndicator={true}
                              nestedScrollEnabled={true}
                              renderItem={({ item: dataItem }) => {
                                const isSelected = items.some(
                                  (e, idx) => e.item?.item?.uuid === dataItem.item?.uuid && idx !== currentCardIndex
                                );

                                return (
                                  <TouchableOpacity
                                    onPress={() => {
                                      if (!isSelected) selectItem(currentCardIndex, dataItem);
                                    }}
                                    disabled={isSelected}
                                    className={`flex-row items-center px-4 py-2 border-b border-gray-200 ${
                                      isSelected ? "opacity-50" : ""
                                    }`}
                                  >
                                    <Icon
                                      name={isSelected ? "times-circle" : "circle"}
                                      size={18}
                                      color={isSelected ? "#ccc" : "#000"}
                                      style={{ marginRight: 8 }}
                                    />
                                    <Text className={`text-base ${isSelected ? "text-gray-400" : "text-black"}`}>
                                      {dataItem.item["Name"]}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              }}
                            />
                          </View>
                        )}

                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="text-sm text-gray-700">
                            <Icon name="sort-numeric-asc" size={14} /> Quantity
                          </Text>
                          {item && (
                            <Text className="text-sm text-green-600 font-medium">
                              <Icon name="cubes" size={14} /> Available: {available}
                            </Text>
                          )}
                        </View>
                        <TextInput
                          className={`border rounded-xl px-3 py-2 mb-2 text-black ${
                            isOverQuantity ? "border-red-500" : "border-gray-300"
                          }`}
                          keyboardType="numeric"
                          value={entry.quantity}
                          onChangeText={(val) => handleUpdate(currentCardIndex, "quantity", val)}
                        />

                        <View className="flex-row justify-between flex-wrap mt-2">
                          <Text className="text-sm w-1/2 text-gray-600">
                            <Icon name="money" size={14} /> Price:{" "}
                            <Text className="text-black font-medium">₹{price.toFixed(2)}</Text>
                          </Text>
                          <Text className="text-sm w-1/2 text-gray-600">
                            <Icon name="percent" size={14} /> Tax:{" "}
                            <Text className="text-black font-medium">
                              ₹{tax.toFixed(2)} ({taxRate}%)
                            </Text>
                          </Text>
                          <Text className="text-sm w-1/2 text-gray-600">
                            <Icon name="calculator" size={14} /> Amount:{" "}
                            <Text className="text-black font-medium">₹{amount.toFixed(2)}</Text>
                          </Text>
                          <Text className="text-sm w-1/2 text-gray-600">
                            <Icon name="inr" size={14} /> Total:{" "}
                            <Text className="text-black font-semibold">₹{total.toFixed(2)}</Text>
                          </Text>
                        </View>
                      </View>
                    );
                  })()}
                </Animated.View>
              )}
            </View>

            {/* FileInputComponent positioned below the card */}
            <View className="mb-4">
              <FileInputComponent setAttachments={setAttachments} attachments={attachments} setNote={setNote} />
            </View>

            {/* Summary Section */}
            <View className="bg-white rounded-2xl p-4 mt-2 mb-20"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text className="text-lg font-bold text-gray-800 mb-3 text-center">
                Order Summary
              </Text>
              <View className="border-b border-gray-200 pb-2 mb-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Total Items:</Text>
                  <Text className="font-semibold">{items.length}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Total Quantity:</Text>
                  <Text className="font-semibold">{totalQuantity}</Text>
                </View>
              </View>
              <View className="border-b border-gray-200 pb-2 mb-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Subtotal:</Text>
                  <Text className="font-semibold">₹{totalPrice.toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Tax:</Text>
                  <Text className="font-semibold">₹{totalTax.toFixed(2)}</Text>
                </View>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-800 font-bold">Grand Total:</Text>
                <Text className="text-[#1996D3] font-bold text-lg">₹{totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      
      {!isKeyboardVisible && (
        <View className="absolute bottom-4 left-4 right-4">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
            className={`rounded-full p-4 ${
              isFormValid ? "bg-[#1996D3]" : "bg-[#B9E4F6]"
            }`}
          >
            <Text className="text-center text-white font-semibold">
              {loading ? "Processing..." : "Create IR"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {popup.visible && (
        <DynamicPopup
          onOk={() => {
            setPopup({ ...popup, show: false });
            navigation.replace("IrDetail", { item: irResponse, uuid: uuid, issueUuid: irResponse.uuid });
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


// import React, { useEffect, useState, useRef, useMemo } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   TouchableWithoutFeedback,
//   Animated,
//   ActivityIndicator,
//   StatusBar,
//   SafeAreaView,
//   Dimensions,
// } from "react-native";
// import Icon from "react-native-vector-icons/FontAwesome";
// import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import GetIssueItems from "../../../service/Inventory/GetItemsList";
// import { CreateIssueRequestApi } from "../../../service/Inventory/CreateIssueRequestApi";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import GetTaxesForItems from "../../../service/Inventory/GetTaxesForItems";
// import DynamicPopup from "../../DynamivPopUps/DynapicPopUpScreen";
// import { useNavigation, useFocusEffect } from "@react-navigation/native";
// import FileInputComponent from "./TextAndFileInput";
// import ItemInputCard from "./ItemInputCard";

// const { width, height } = Dimensions.get("window");

// const CreateIRScreen = ({ route }) => {
//   // State management
//   const [data, setData] = useState([]);
//   const [taxData, setTaxData] = useState([]);
//   const [userid, setUserId] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const uuid = route?.params?.uuid || null;
//   const [irResponse, setIrResponse] = useState({});
//   const [attachments, setAttachments] = useState([]);
//   const [note, setNote] = useState("");
//   const [currentCardIndex, setCurrentCardIndex] = useState(0);
//   const slideAnimation = useRef(new Animated.Value(0)).current;
//   const fadeAnim = useRef(new Animated.Value(1)).current;
//   const [popup, setPopup] = useState({
//     visible: false,
//     type: "success",
//     message: "",
//   });
//   const [items, setItems] = useState([
//     { id: Date.now(), item: null, quantity: "", isDropdownOpen: false, search: "", error: null },
//   ]);
//   const [isKeyboardVisible, setKeyboardVisible] = useState(false);
//   const [cardSwipeDirection, setCardSwipeDirection] = useState("left");
//   const scrollViewRef = useRef(null);
//   const navigation = useNavigation();

//   // Animation functions with improved timings and transitions
//   const animateSlide = (direction) => {
//     setCardSwipeDirection(direction);
    
//     // Start by fading out the current card
//     Animated.timing(fadeAnim, {
//       toValue: 0,
//       duration: 150,
//       useNativeDriver: true,
//     }).start(() => {
//       // Set the new slide position
//       slideAnimation.setValue(direction === "right" ? -width * 0.5 : width * 0.5);
      
//       // Then animate both the slide and fade in simultaneously
//       Animated.parallel([
//         Animated.spring(slideAnimation, {
//           toValue: 0,
//           friction: 8,
//           tension: 40,
//           useNativeDriver: true,
//         }),
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 250,
//           useNativeDriver: true,
//         })
//       ]).start();
//     });
//   };

//   // Data fetching with better error handling
//   const fetchData = async () => {
//     try {
//       setInitialLoading(true);
//       const userInfo = await AsyncStorage.getItem("userInfo");
//       if (!userInfo) {
//         throw new Error("User information not found");
//       }
      
//       const parsedUserInfo = JSON.parse(userInfo);
//       const userId = parsedUserInfo.data.id;
//       setUserId(userId);

//       // Fetch data in parallel for better performance
//       const [itemsResponse, taxesResponse] = await Promise.all([
//         GetIssueItems(uuid),
//         GetTaxesForItems(uuid)
//       ]);
      
//       setData(itemsResponse.data || []);
//       setTaxData(taxesResponse.data || []);
//     } catch (error) {
//       console.error("Error fetching data:", error.message || error);
//       setPopup({
//         visible: true,
//         type: "error",
//         message: "Failed to load data. Please try again.",
//       });
//     } finally {
//       setInitialLoading(false);
//     }
//   };

//   // Initial data load
//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Set up keyboard listeners
//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () =>
//       setKeyboardVisible(true)
//     );
//     const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () =>
//       setKeyboardVisible(false)
//     );

//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);

//   // Refresh data when screen is focused
//   useFocusEffect(
//     React.useCallback(() => {
//       fetchData();
//       return () => {};
//     }, [])
//   );

//   // Utility functions
//   const getTaxRateByUUID = (uuid) => {
//     const tax = taxData?.find((t) => t.uuid === uuid);
//     return tax ? tax.Rate : 0;
//   };

// const validateItemEntry = (entry, index) => {
//   const errors = [];

//   // Check if entry is a valid object with an item key
//   if (typeof entry !== 'object' || Array.isArray(entry) || !entry.item) {
//     errors.push("Please select an item");
//   } else {
//     const quantity = parseInt(entry?.quantity);
//     const availableStock = parseInt(entry?.item?.stock[0]?.Stock) || 0;
//     if (quantity <= 0) {

//       errors.push("Quantity must be greater than 0");
//     } else if (quantity > availableStock) {
//       errors.push(`Exceeds available stock (${availableStock})`);
//     }
//   }

//   // Update the item with error information
//   const updated = [...items];
//   updated[index].error = errors.length > 0 ? errors.join(". ") : null;
//   setItems(updated);

//   return errors.length === 0;
// };

//   // Item management functions
//   const handleAddItem = () => {
//     const newItems = [
//       ...items,
//       {
//         id: Date.now(),
//         item: null,
//         quantity: "",
//         isDropdownOpen: false,
//         search: "",
//         error: null,
//       },
//     ];
//     setItems(newItems);
//     setCurrentCardIndex(newItems.length - 1);
//     animateSlide("left");
//   };

//   const handleRemoveItem = (id) => {
//     if (items.length === 1) {
//       // Show alert if trying to remove the last item
//       Alert.alert(
//         "Cannot Remove",
//         "You need at least one item in the request.",
//         [{ text: "OK" }]
//       );
//       return;
//     }
    
//     const itemIndex = items.findIndex((item) => item.id === id);
//     const updated = items.filter((entry) => entry.id !== id);
//     setItems(updated);
    
//     if (itemIndex <= currentCardIndex) {
//       const newIndex = Math.min(currentCardIndex - 1, updated.length - 1);
//       setCurrentCardIndex(newIndex);
//     }
    
//     if (updated.length > 0) {
//       animateSlide("right");
//     }
//   };

//   const handleUpdate = (index, key, value) => {
//     const updated = [...items];
//     updated[index][key] = value;
    
//     // Validate on change for immediate feedback
//     if ((key === 'item' || key === 'quantity') && updated[index].item) {
//       validateItemEntry(updated[index], index);
//     }
    
//     setItems(updated);
//   };

//   const toggleDropdown = (index) => {
//     const updated = [...items];
//     // Close any other open dropdowns first
//     updated.forEach((item, idx) => {
//       if (idx !== index) {
//         updated[idx].isDropdownOpen = false;
//       }
//     });
//     updated[index].isDropdownOpen = !updated[index].isDropdownOpen;
//     setItems(updated);
//   };

//   const selectItem = (index, item) => {
//     const updated = [...items];
//     updated[index].item = item;
//     updated[index].isDropdownOpen = false;
//     updated[index].search = item.item["Name"];
    
//     // Auto-set quantity to 1 if not set
//     if (!updated[index].quantity || parseInt(updated[index].quantity) <= 0) {
//       updated[index].quantity = "1";
//     }
    
//     // Validate immediately after selection
//     validateItemEntry(updated[index], index);
//     setItems(updated);
//   };

//   const filterItems = (search) => {
//     if (!search || search.length === 0) return data;
//     const lowerSearch = search.toLowerCase();
//     return data?.filter((i) => {
//       const name = i.item?.["Name"]?.toLowerCase() || "";
//       const sequence = i.item?.["Sequence No"]?.toString().toLowerCase() || "";
//       return name.includes(lowerSearch) || sequence.includes(lowerSearch);
//     });
//   };

//   // Navigation functions
//   const goToPrevCard = () => {
//     if (currentCardIndex > 0) {
//       setCurrentCardIndex(currentCardIndex - 1);
//       animateSlide("right");
//     }
//   };

//   const goToNextCard = () => {
//     if (currentCardIndex < items.length - 1) {
//       setCurrentCardIndex(currentCardIndex + 1);
//       animateSlide("left");
//     }
//   };

//   // Calculate totals and prepare payload
//   const orderSummary = useMemo(() => {
//     let totalQuantity = 0;
//     let totalPrice = 0;
//     let totalTax = 0;
//     let totalAmount = 0;
//     let itemsList = [];

//     items.forEach((entry) => {
//       const item = entry.item;
//       if (!item) return;
//       const quantity = parseInt(entry.quantity) || 0;
//       const price = parseFloat(item?.item?.["Purchase Price"] || 0);
//       const taxRate = getTaxRateByUUID(item?.item?.Tax);
//       const amount = price * quantity;
//       const tax = (amount * taxRate) / 100;
//       const total = amount + tax;

//       totalQuantity += quantity;
//       totalPrice += amount;
//       totalTax += tax;
//       totalAmount += total;

//       itemsList.push({
//         Name: item?.item?.["Name"],
//         item_id: item?.item?.uuid,
//         item_uuid: item?.item?.uuid,
//         Quantity: quantity,
//         Price: parseFloat(price.toFixed(2)),
//         Tax: item?.item?.Tax || 0,
//         Amount: parseFloat(amount.toFixed(2)),
//         Return:0,
//         "Total Price": parseFloat(total.toFixed(2)),
//         // stock_before: item?.item?.["Current Stock"] || 0,
//         // stock_after: (item?.item?.["Current Stock"] || 0) - quantity,
//       });
//     });

//     return {
//       totalQuantity,
//       totalPrice,
//       totalTax,
//       totalAmount,
//       itemsList
//     };
//   }, [items, taxData]);

//   // Create header payload
//   const headerPayload = {


//   "Date":  new Date().toISOString().split("T")[0],
//   "Status": "DRAFT",
//   "Unit_No": "",
//   "created_by": userid,
//   Return:0,
//   "Total Quantity": orderSummary.totalQuantity,
//   "Total Item": items.filter(item => item.item !== null).length,
//   "Total Price":parseFloat(orderSummary.totalPrice.toFixed(2)),
//   "Total Tax": parseFloat(orderSummary.totalTax.toFixed(2)) || "0.00",
//   "Total Amount": parseFloat(orderSummary.totalAmount.toFixed(2)),
//    warehouse_id: uuid,
//    Notes: note,
// ...(attachments && attachments.length > 0 && { attachments }),
//   };

//   // Form submission
//   const handleSubmit = async () => {
//     // Validate all items
//     let isValid = true;
//     for (let i = 0; i < items.length; i++) {
//       if (!validateItemEntry(items[i], i)) {
//         isValid = false;
//         // Navigate to the first invalid item
//         if (i !== currentCardIndex) {
//           setCurrentCardIndex(i);
//           animateSlide(i > currentCardIndex ? "left" : "right");
//         }
//         break;
//       }
//     }

//     if (!isValid) {
//       setPopup({
//         visible: true,
//         type: "error",
//         message: "Please fix the errors in your items before submitting.",
//       });
//       return;
//     }

//     if (items.filter(item => item.item !== null).length === 0) {
//       setPopup({
//         visible: true,
//         type: "error",
//         message: "Please add at least one valid item to your request.",
//       });
//       return;
//     }

//     try {
//       setSubmitting(true);
//       const response = await CreateIssueRequestApi(
//         headerPayload, 
//         orderSummary.itemsList
//       );
//       setIrResponse(response.data);
//       setPopup({
//         visible: true,
//         type: "success",
//         message: "Issue Request created successfully!",
//       });
//     } catch (error) {
//       console.error("Submission Error:", error.message || error);
//       setPopup({
//         visible: true,
//         type: "error",
//         message: `Failed to submit: ${error.message || "Please try again"}`,
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };


//   // Loading screen
//   if (initialLoading) {
//     return (
//       <SafeAreaView className="flex-1 bg-[#F8FAFC] justify-center items-center">
//         <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
//         <ActivityIndicator size="large" color="#1996D3" />
//         <Text className="mt-4 text-gray-600">Loading inventory data...</Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1  bg-[#F8FAFC]">
//       <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
//       <KeyboardAvoidingView
//         className="flex-1"
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//       >
  
        
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//           <ScrollView 
//             className="flex-1"
//             ref={scrollViewRef}
//             contentContainerStyle={{ paddingBottom: 120 }}
//           >
//             <View className="p-0">
//               {/* Progress Indicator */}
          

//               {/* Card Container with improved animations */}
//               <View className="" >
//                 {items.length > 0 && (
//                   <Animated.View
//                     style={{
//                       transform: [{ translateX: slideAnimation }],
//                       opacity: fadeAnim,
//                     }}
//                   >
//                     <ItemInputCard
//                       entry={items[currentCardIndex]}
//                       index={currentCardIndex}
//                       items={items}
//                       data={data}
//                       taxData={taxData}
//                       loading={loading}
//                       handleUpdate={handleUpdate}
//                       toggleDropdown={toggleDropdown}
//                       selectItem={selectItem}
//                       handleRemoveItem={handleRemoveItem}
//                       filterItems={filterItems}
//                       validateItemEntry={() => validateItemEntry(items[currentCardIndex], currentCardIndex)}
//                     />
//                   </Animated.View>
//                 )}
//               </View>

//               {/* FileInputComponent - kept unchanged but possibly enhance in ItemInputCard component */}
//               <View className="mb-4">
//                 <FileInputComponent 
//                   setAttachments={setAttachments} 
//                   attachments={attachments} 
//                   setNote={setNote} 
//                   note={note}
//                 />
//               </View>

//               {/* Improved Summary Section */}
//               <View
//                 className="bg-white rounded-2xl p-4 pb-32"
//                 style={{
//                   shadowColor: "#000",
//                   shadowOffset: { width: 0, height: 2 },
//                   shadowOpacity: 0.06,
//                   shadowRadius: 4,
//                   elevation: 2,
//                 }}
//               >
//                 <Text className="text-lg font-bold text-gray-800 mb-3 text-center">
//                   Order Summary
//                 </Text>
//                 <View className="border-b border-gray-200 pb-2 mb-2">
//                   <View className="flex-row justify-between">
//                     <Text className="text-gray-600">Total Items:</Text>
//                     <Text className="font-semibold">{items.filter(item => item.item !== null).length}</Text>
//                   </View>
//                   <View className="flex-row justify-between">
//                     <Text className="text-gray-600">Total Quantity:</Text>
//                     <Text className="font-semibold">{orderSummary.totalQuantity}</Text>
//                   </View>
//                 </View>
//                 <View className="border-b border-gray-200 pb-2 mb-2">
//                   <View className="flex-row justify-between">
//                     <Text className="text-gray-600">Subtotal:</Text>
//                     <Text className="font-semibold">₹{orderSummary.totalPrice.toFixed(2)}</Text>
//                   </View>
//                   <View className="flex-row justify-between">
//                     <Text className="text-gray-600">Tax:</Text>
//                     <Text className="font-semibold">₹{orderSummary.totalTax.toFixed(2)}</Text>
//                   </View>
//                 </View>
//                 <View className="flex-row justify-between">
//                   <Text className="text-gray-800 font-bold">Grand Total:</Text>
//                   <Text className="text-[#1996D3] font-bold text-lg">₹{orderSummary.totalAmount.toFixed(2)}</Text>
//                 </View>
//               </View>
//             </View>
//           </ScrollView>
//         </TouchableWithoutFeedback>

//         {/* Improved bottom navigation bar with visual feedback */}
//         {!isKeyboardVisible && (
//           <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pt-2 pb-6">
//             <View className="flex-row justify-between items-center mb-3">
//               <TouchableOpacity
//                 onPress={goToPrevCard}
//                 disabled={currentCardIndex === 0}
//                 className={`flex-row items-center px-4 py-2 rounded-full ${
//                   currentCardIndex === 0 ? "bg-gray-200" : "bg-[#1996D3]"
//                 }`}
//               >
//                 <Icon name="chevron-left" size={20} color={currentCardIndex === 0 ? "#999" : "#fff"} />
//                 <Text className={`ml-1 ${currentCardIndex === 0 ? "text-gray-600" : "text-white"} font-medium`}>
//                   Previous
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={handleAddItem}
//                 className="flex-row items-center justify-center bg-[#1996D3] px-4 py-2 rounded-full shadow"
//               >
//                 <Icon name="plus" size={16} color="#fff" />
//                 <Text className="text-white font-bold ml-1">Add Item</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={goToNextCard}
//                 disabled={currentCardIndex === items.length - 1}
//                 className={`flex-row items-center px-4 py-2 rounded-full ${
//                   currentCardIndex === items.length - 1 ? "bg-gray-200" : "bg-[#1996D3]"
//                 }`}
//               >
//                 <Text
//                   className={`mr-1 ${currentCardIndex === items.length - 1 ? "text-gray-600" : "text-white"} font-medium`}
//                 >
//                   Next
//                 </Text>
//                 <Icon
//                   name="chevron-right"
//                   size={20}
//                   color={currentCardIndex === items.length - 1 ? "#999" : "#fff"}
//                 />
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity
//               onPress={handleSubmit}
//               disabled={submitting}
//               className={`rounded-full p-4 mb-12 ${
//                  !submitting ? "bg-[#1996D3]" : "bg-[#B9E4F6]"
//               }`}
//             >
//               {submitting ? (
//                 <View className="flex-row justify-center items-center">
//                   <ActivityIndicator size="small" color="#fff" />
//                   <Text className="text-center text-white font-semibold ml-2">
//                     Processing...
//                   </Text>
//                 </View>
//               ) : (
//                 <Text className="text-center text-white font-semibold">
//                   Create IR
//                 </Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Dynamic Popup with improved UI */}
//         {popup.visible && (
//           <DynamicPopup
//             onOk={() => {
//               if (popup.type === "success") {
//                 navigation.navigate("IrDetail", { 
//                   item: irResponse, 
//                   uuid: uuid, 
//                   issueUuid: irResponse.uuid 
//                 });
//               }
//               setPopup({ ...popup, visible: false });
//             }}
//             type={popup.type}
//             message={popup.message}
//             onClose={() => setPopup({ ...popup, visible: false })}
//           />
//         )}
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default CreateIRScreen;