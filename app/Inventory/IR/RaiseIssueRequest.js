import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import GetIssueItems from "../../../service/Inventory/GetItemsList";
import  {CreateIssueRequestApi} from "../../../service/Inventory/CreateIssueRequestApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GetTaxesForItems from "../../../service/Inventory/GetTaxesForItems";
import { ActivityIndicator } from "react-native-web";
import DynamicPopup from "../../DynamivPopUps/DynapicPopUpScreen";
import { useNavigation } from "@react-navigation/native";
import FileInputComponent from "./TextAndFileInput";

const CreateIRScreen = ({route}) => {
  const [data, setData] = useState([]);
  const [taxData, setTaxData] = useState([]);
  const [userid, setUserId] = useState("");
  const [loading,setLoading] = useState(false)
  const uuid = route?.params?.uuid  || null;
  const[irResponse,setIrResposne]  = useState({})
  const [attachments,setAttachments]  = useState([])
  const [note,setNote]  = useState('')
  const [popup, setPopup] = useState({
    visible: false,
    type: "success", // success, error, etc.
    message: "",
  });
  
  const [items, setItems] = useState([
    { id: Date.now(), item: null, quantity: "", isDropdownOpen: false, search: "" },
  ]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
const navigation = useNavigation()
  const fetchData = async () => {
    try {
      setLoading(true)
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
    }finally{
      setLoading(false)
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
    setItems([
      ...items,
      {
        id: Date.now(),
        item: null,
        quantity: "",
        isDropdownOpen: false,
        search: "",
      },
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length === 1) return;
    const updated = items?.filter((entry) => entry.id !== id);
    setItems(updated);
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
      Tax:  item?.item?.Tax || "",
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
    Return:0,
    warehouse_id : uuid,
    "Total Quantity": totalQuantity,
    "Total Item": items.length,
    "Total Price": parseFloat(totalPrice.toFixed(2)),
    "Total Tax": parseFloat(totalTax.toFixed(2)),
    "Total Amount": parseFloat(totalAmount.toFixed(2)),
    Notes:note,
    attachments:attachments

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
      setLoading(true)
   const response =   await CreateIssueRequestApi(headerPayload,itemList,);
   setIrResposne(response.data)
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
      });    }finally{
      setLoading(false)
    }
  };

  const isItemSelectedElsewhere = (item) => {
    return items.some((entry, i) => entry.item?.item?.uuid === item.item?.uuid && entry !== currentEntry);
  };
  
  // Check form validity
  const isFormValid = items.length > 0 && items.every(entry => {
    const quantity = parseInt(entry.quantity) || 0;
    const availableStock = entry.item?.stock[0].Stock || 0;
    return entry.item && quantity > 0 && quantity <= availableStock;
  });
  
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F8FAFC]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
        <ScrollView
  className="p-4"
  contentContainerStyle={{ paddingBottom: 220 }}
  keyboardShouldPersistTaps="handled"
  nestedScrollEnabled={true} // ✅ Important
>

        <View>
          <FileInputComponent  setAttachments={setAttachments} attachments={attachments} setNote={setNote} />
        </View>

            {items?.map((entry, index) => {
        
              const item = entry.item;
              const price = parseFloat(item?.item?.["Purchase Price"] || 0);
              const taxRate = getTaxRateByUUID(item?.item?.Tax || "");
              const quantity = parseInt(entry.quantity) || 0;
              const tax = (price * quantity * taxRate) / 100;
              const amount = price * quantity;
              const total = amount + tax;
              const available = entry?.item?.stock[0]?.Stock || 0;
              const isOverQuantity = quantity > available;

              return (
                <View
                  key={entry.id}
                  className="bg-white rounded-2xl p-4  mb-4 relative"
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
                    onPress={() => toggleDropdown(index)}
                    className="border border-gray-300 rounded-xl px-3 py-2 mb-1 flex-row justify-between items-center"
                  >
                    <TextInput
                      className="text-black flex-1"
                      placeholder={entry.item ? "" : "Choose item"}
                      value={entry.search}
                      onChangeText={(text) => {
                        handleUpdate(index, "search", text);
                        handleUpdate(index, "item", null);
                      }}
                      onFocus={() => handleUpdate(index, "isDropdownOpen", true)}
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
  nestedScrollEnabled={true}  // Allow inner scroll separately
  keyboardShouldPersistTaps="handled"
  showsVerticalScrollIndicator={true}  // Make sure the scroll is visible

  className="border border-gray-300 rounded-xl bg-white mb-3">
    <FlatList
      data={filterItems(entry.search)}
      keyExtractor={(item, i) => item.item?.uuid || i.toString()}
      showsVerticalScrollIndicator={true}
      scrollEnabled={false}
      
      renderItem={({ item, index: i }) => {
        const isSelected = items?.some(
          (entry, idx) => entry.item?.item?.uuid === item.item?.uuid && idx !== index
        );

        return (
          <TouchableOpacity
            onPress={() => {
              if (!isSelected) selectItem(index, item);
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
              {item.item["Name"]}
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
                    onChangeText={(val) => handleUpdate(index, "quantity", val)}
                  />

                  <View className="flex-row justify-between flex-wrap mt-2">
                    <Text className="text-sm w-1/2 text-gray-600">
                      <Icon name="money" size={14} /> Price:{" "}
                      <Text className="text-black font-medium">₹{price}</Text>
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
            })}
               <TouchableOpacity
                onPress={handleAddItem}
                className=" flex-row  w-1/3 items-center justify-center  bg-[#1996D3] p-3 rounded-full shadow-lg"
                style={{ elevation: 6 }}
              >
                <Icon name="plus" size={20} color="#fff" />
                <Text className="text-white font-black px-1">ADD</Text>
              </TouchableOpacity>
          </ScrollView>
       

          {!isKeyboardVisible && (
            <View className ="bottom-12">
              {/* Floating Add Button */}
             

              {/* Fixed Submit Button */}
              <View className="absolute bottom-4 left-4 right-4">
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!isFormValid || loading }
                  className={`rounded-full p-4 ${
                    isFormValid ? "bg-[#1996D3]" : "bg-[#B9E4F6]"
                  }`}
                >
                  <Text className="text-center text-white font-semibold">
                  { loading ? "loading..." : "Create IR"}
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
    setPopup({ ...popup, show: false });  // Close the popup
    navigation.replace("IrDetail", { item: irResponse, uuid:uuid,issueUuid:irResponse.uuid });
  
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
