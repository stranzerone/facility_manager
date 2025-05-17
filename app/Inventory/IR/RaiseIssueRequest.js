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
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import GetIssueItems from "../../../service/Inventory/GetItemsList";
import { CreateIssueRequestApi } from "../../../service/Inventory/CreateIssueRequestApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GetTaxesForItems from "../../../service/Inventory/GetTaxesForItems";
import DynamicPopup from "../../DynamivPopUps/DynapicPopUpScreen";
import { useNavigation } from "@react-navigation/native";
import FileInputComponent from "./TextAndFileInput";
import ItemEntry from "./ItemInputCard"
// Memoized Item Component for better performance
const CreateIRScreen = ({ route }) => {
  const [data, setData] = useState([]);
  const [taxData, setTaxData] = useState([]);
  const [userid, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [invLoading,setInvLoading] = useState(false)
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

  const [items, setItems] = useState([
    { id: Date.now(), item: null, quantity: "", isDropdownOpen: false, search: "" },
  ]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const navigation = useNavigation();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setInvLoading(true)
      const userInfo = await AsyncStorage.getItem("userInfo");
      const parsedUserInfo = JSON.parse(userInfo);
      const userId = parsedUserInfo.data.id;
      setUserId(userId);
      
      if (!userInfo) throw new Error("User information not found in AsyncStorage");

      const response = await GetIssueItems(uuid);
      const taxResponse = await GetTaxesForItems(uuid);
      
      // Pre-process and optimize the data
      const processedData = response?.data?.map(item => ({
        ...item,
        searchText: (item.item?.["Name"] || "") + (item.item?.["Sequence No"] || "")
      }));
      
      setData(processedData);
      setTaxData(taxResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error.message || error);
    } finally {
      setLoading(false);
      setInvLoading(false)
    }
  }, [uuid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    }, 100); // Adjust if needed
  }, []);

  const handleRemoveItem = useCallback((id) => {
    if (items.length === 1) return;
    setItems(prevItems => prevItems.filter((entry) => entry.id !== id));
  }, [items.length]);

  const handleUpdate = useCallback((index, key, value) => {
    setItems(prevItems => {
      const updated = [...prevItems];
      updated[index][key] = value;
      return updated;
    });
  }, []);

  const toggleDropdown = useCallback((index) => {
    setItems(prevItems => {
      const updated = [...prevItems];
      // Close all other dropdowns first for better performance
      updated.forEach((item, i) => {
        if (i !== index) {
          updated[i].isDropdownOpen = false;
        }
      });
      updated[index].isDropdownOpen = !updated[index].isDropdownOpen;
      return updated;
    });
  }, []);

  const selectItem = useCallback((index, item) => {
    setItems(prevItems => {
      const updated = [...prevItems];
      updated[index].item = item;
      updated[index].isDropdownOpen = false;
      updated[index].search = item.item["Name"];

      // Set default quantity to 1 if empty or 0
      if (!updated[index].quantity || parseInt(updated[index].quantity) <= 0) {
        updated[index].quantity = "1";
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
    });
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
        
        Name: item?.item?.["Name"],
        item_id: item?.item?.uuid,
        item_uuid: item?.item?.uuid,
        Quantity: quantity,
        Price: parseFloat(price.toFixed(2)),
        Tax: item?.item?.Tax || "",
        Amount: parseFloat(amount.toFixed(2)),
        "Total Price": parseFloat(total.toFixed(2)),
        stock_before: item?.stock[0]?.Stock || 0,
        stock_after: item?.stock[0]?.Stock - quantity,
      };
    });

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
    created_by: "",
    warehouse_id: uuid,
    "Total Quantity": totals.totalQuantity,
    "Total Item": items.length,
    "Total Price": totals.totalPrice,
    "Total Tax": totals.totalTax || "0.00",
    "Total Amount": totals.totalAmount,
 ...(note ? { Notes: note } : {}),
 ...(attachments.length > 0 ? { attachments: attachments } : {}),
  }), [totals, uuid, note, attachments, items.length]);

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
      setIrResponse(response?.data);
      if(response.data){
      setPopup({
        visible: true,
        type: "success",
        message: "Issue Request created successfully!",
      });
    }else{
            setPopup({
        visible: true,
        type: "error",
        message: "erro while creating",
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
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="mt-2 text-base text-gray-600">Loading...</Text>
    </View>
  );
}


  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F8FAFC]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <ScrollView
          ref={scrollViewRef}
            className="p-4"
            contentContainerStyle={{ paddingBottom: 150 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            removeClippedSubviews={true} // Improve memory usage by unmounting views outside the viewport
          >
                       <View className="mt-4">
              <FileInputComponent setAttachments={setAttachments} attachments={attachments} setNote={setNote} setLoading={setLoading} />
            </View>

      
            {/* Use map instead of FlatList for item rendering */}
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
              />
            ))}
            

            <TouchableOpacity
              onPress={handleAddItem}
              className="flex-row w-1/3 items-center justify-center bg-[#1996D3] p-3 rounded-full shadow-lg"
              style={{ elevation: 6 }}
            >
              <Icon name="plus" size={20} color="#fff" />
              <Text className="text-white font-black px-1">ADD</Text>
            </TouchableOpacity>
       
          </ScrollView>

          {!isKeyboardVisible && (
            <View className="bottom-12">
              {/* Fixed Submit Button */}
              <View className="absolute bottom-4 left-4 right-4">
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!isFormValid || loading}
                  className={`rounded-full p-4 ${
                    isFormValid ? "bg-[#1996D3]" : "bg-[#B9E4F6]"
                  }`}
                >
                  <Text className="text-center text-white font-semibold">
                    {loading ? "loading..." : "Create IR"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
      
      {popup.visible && (
        <DynamicPopup
          onOk={() => {
            setPopup({ ...popup, show: false });
            if(popup.type ==="success"){
            navigation.replace("IrDetail", { item: irResponse, uuid: uuid, issueUuid: irResponse.uuid });
            }else{
                 setPopup({
        visible: false,
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