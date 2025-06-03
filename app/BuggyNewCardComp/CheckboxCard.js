import { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import RemarkCard from "./RemarkCard";
import styles from "./styles";
import Icon from 'react-native-vector-icons/FontAwesome';
import useConvertToSystemTime from "../TimeConvertot/ConvertUtcToIst";
import { workOrderService } from "../../services/apis/workorderApis";
import { usePermissions } from "../GlobalVariables/PermissionsContext";
import ImageViewing from "react-native-image-viewing";
import CheckboxCardHeader from "./TopRow";

const CheckboxCard = ({ item, onUpdate, editable }) => {
  const { nightMode } = usePermissions();
  const [isChecked, setIsChecked] = useState(item.result === "1");
  const updatedTime = useConvertToSystemTime(item?.updated_at);
  const [modalVisible, setModalVisible] = useState(false);

  console.log(item, 'this is item for check')
  const backgroundColor = editable
    ? isChecked
      ? nightMode ? "#254D32" : "#DFF6DD"
      : nightMode ? "#1F1F1F" : "#FFFFFF"
    : isChecked
      ? nightMode ? "#1F3F2B" : "#DCFCE7"
      : nightMode ? "#121212" : "#E5E7EB";

  const textColor = nightMode ? "#F3F4F6" : "#1F2937";

  const handleCheckboxPress = async () => {
    const newState = !isChecked;
    setIsChecked(newState);

    const payload = {
      id: item.id,
      result: newState ? "1" : "0",
      WoUuId: item.ref_uuid,
      image: false,
    };

    try {
      const response = await workOrderService.updateInstruction(payload);
      console.log(response, 'this is for update');
      onUpdate();
    } catch (error) {
      console.error("Error updating instruction:", error);
    }
  };

  const handleTitlePress = () => {
    handleCheckboxPress();
  };

  return (
    <View style={[styles.inputContainer, { backgroundColor }]} className="p-3 border border-gray-200 rounded-md mb-3 shadow-sm">

      {/* Top Row */}
{/* Top Row */}
<CheckboxCardHeader
  item={item}
  nightMode={nightMode}
  updatedTime={updatedTime}
  modalVisible={modalVisible}
  setModalVisible={setModalVisible}
/>

      {/* Checkbox + Title */}
      <View className="flex-row items-center justify-center mb-2">
        <Text className="font-bold text-md mr-2" style={{ color: textColor }}>{item.order}.</Text>
        <CircularCheckbox editable={editable} isChecked={isChecked} onPress={handleCheckboxPress} />
        <TouchableOpacity disabled={!editable} onPress={handleTitlePress} className="ml-3 flex-1">
          <Text numberOfLines={4} style={[styles.title, { color: textColor }]}>{item.title}</Text>
        </TouchableOpacity>
      </View>

      {/* Remark */}
      <RemarkCard item={item} editable={editable} />
      {modalVisible && (
        <ImageViewing
          images={[{ uri: item.image }]}
          imageIndex={0}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
};

const CircularCheckbox = ({ isChecked, onPress, editable, nightMode }) => {
  const borderColorClass = nightMode ? "border-white" : "border-black";

  return (
    <TouchableOpacity
      disabled={!editable}
      onPress={onPress}
      className="flex items-center justify-center"
    >
      <View className={`w-5 h-5 rounded-full border-2 ${borderColorClass} flex items-center justify-center`}>
        {isChecked && (
          <View className="w-3.5 h-3.5 rounded-full bg-[#074B7C]" />
        )}
      </View>
    </TouchableOpacity>
  );
};



export default CheckboxCard;