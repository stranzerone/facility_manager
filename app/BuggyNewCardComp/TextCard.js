import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import RemarkCard from "./RemarkCard";
import styles from "../BuggyListCardComponets/InputFieldStyleSheet";
import { UpdateInstructionApi } from "../../service/BuggyListApis/UpdateInstructionApi";
import Icon from "react-native-vector-icons/FontAwesome";
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";

const TextCard = ({ item, onUpdate, editable, type }) => {
  const [value, setValue] = useState(item.result || "");
  const updatedTime =useConvertToSystemTime(item?.updated_at)
  const handleBlur = async () => {
    try {
      const payload = {
        id: item.id,
        value: value.trim(),
        WoUuId: item.ref_uuid,
        image: false,
      };

      await UpdateInstructionApi(payload);
      onUpdate();
    } catch (error) {
      console.error("Error updating instruction:", error);
      Alert.alert("Error", "Failed to update instruction.");
    }
  };

  return (
    <View
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View
        style={[
          styles.inputContainer,
          editable?value? { backgroundColor: "#DFF6DD" } :{backgroundColor:"white"}:value?{ backgroundColor: "#DCFCE7" } : { backgroundColor: "#E5E7EB" }, // Light green if a value is selected

        ]}
      >
     <View className="flex-row p-2">
      <Text className="font-bold  text-xl mr-2">{item.order}.</Text>
      
      <Text style={styles.title}>{item.title}</Text>

      </View>
        {editable ? (
          <TextInput
            style={styles.inputContainer}
            value={value}
            onChangeText={setValue}
            keyboardType={type === "number" ? "numeric" : "default"}
            onBlur={handleBlur}
            placeholder={type === "number" ? "Enter Numerical Value" : "Enter your text"}
          />
        ) : (
          <Text style={styles.inputContainer}>{item.result}</Text>
        )}

        <RemarkCard item={item} editable={editable} />

     
<View className="flex-1 bg-transparent justify-end  px-4 py-2 mt-4 h-8">

   { item.result || item?.data?.optional ?  
    <View >
{item.result && updatedTime &&  <Text className="text-gray-500 text-[11px]  font-bold">
   Updated at : {updatedTime}
  </Text>}

          </View>:null}
          {item?.data?.optional && (
            <View className="flex-row justify-end gap-1 items-center absolute bottom-2 right-0">
              <Icon name="info-circle" size={16} color="red" />
              <Text className="text-xs text-red-800 font-bold mr-2">Optional</Text>
            </View>
                  )}
          </View>
  
      </View>
    </View>
  );
};

export default TextCard;
