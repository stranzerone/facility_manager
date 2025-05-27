import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { workOrderService } from "../../services/apis/workorderApis";
import { usePermissions } from "../GlobalVariables/PermissionsContext";

const formatRestrictedTime = (time) => {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  const totalHours = hours + minutes / 60;
  if (totalHours >= 48) {
    const days = Math.floor(totalHours / 24);
    return `${days} day${days > 1 ? "s" : ""}`;
  } else if (totalHours >= 24) {
    return "1 day";
  } else if (totalHours >= 1) {
    return `${Math.floor(totalHours)} hour${Math.floor(totalHours) > 1 ? "s" : ""}`;
  } else {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
};

const RestrictionCard = ({ wo, restricted, restrictedTime, description, onUpdate }) => {
  const { nightMode } = usePermissions();
  const [delayReason, setDelayReason] = useState(wo.delay_reason || "");
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");

  const formattedTime = formatRestrictedTime(restrictedTime);

  const GetCategoryInfo = async () => {
    try {
      const response = await workOrderService.getCategories();
      const cat = response.data?.find((item) => item.uuid == wo.category_uuid);
      setCategory(cat?.Name);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    GetCategoryInfo();
  }, []);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const dateObj = new Date(dateTimeString.replace(" ", "T"));
    if (isNaN(dateObj)) return 'Invalid Date';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase();
    return `${year}/${month}/${day} ${formattedTime}`;
  };

  const uploadDelayReason = async () => {
    if (!delayReason.trim()) {
      Alert.alert("Error", "Please enter a delay reason before submitting.");
      return;
    }

    setLoading(true);
    try {
      const response = await workOrderService.updateDelayResone(wo.uuid, delayReason);
      if (response.data?.flag_delay_reason) {
        setDelayReason(response.flag_delay_reason);
      }
      if (onUpdate) onUpdate();
      setShowInput(false);
      Alert.alert("Success", "Delay reason updated successfully.");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const textColor = nightMode ? "#eee" : "#1e293b";
  const bgColor = nightMode ? "#1a1a1a" : "#eff6ff";
  const borderColor = nightMode ? "#333" : "#cbd5e1";
  const secondaryBg = nightMode ? "#2a2a2a" : "#ffffff";

  return (
    <View style={{
      backgroundColor: bgColor,
      borderColor: borderColor,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <FontAwesome name="tag" size={16} color="#074B7C" />
        <Text style={{ marginLeft: 6, fontWeight: "bold", fontSize: 16, color: textColor }}>{wo.Name}</Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        <Tag icon="id-badge" text={wo["Sequence No"]} nightMode={nightMode} bg="#e0f2fe" />
        {category && <Tag icon="folder" text={category} nightMode={nightMode} bg="#dcfce7" />}
        <Tag icon="exclamation-circle" text={wo.Type} nightMode={nightMode} bg="#fef9c3" />

        {wo.wo_restriction_time && (
          <Tag
            icon="clock-o"
            text={restricted ? `${formattedTime} ago` : `In ${formattedTime}`}
            nightMode={nightMode}
            bg={restricted ? "#fee2e2" : "#dcfce7"}
            color={restricted ? "#dc2626" : "#16a34a"}
          />
        )}
      </View>

      {restricted && (
        <>
          <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <FontAwesome name="stop-circle" size={18} color="red" />
            <Text style={{ color: "red", fontWeight: "bold", marginLeft: 6 }}>Restriction Applied</Text>
          </View>

          <View style={{
            backgroundColor: secondaryBg,
            borderRadius: 8,
            padding: 10,
            marginTop: 8,
          }}>
            {!showInput ? (
              <TouchableOpacity onPress={() => setShowInput(true)}>
                <Text style={{ fontWeight: "bold", color: textColor }}>Delay Reason</Text>
                <Text style={{ color: nightMode ? "#bbb" : "#555", marginTop: 4 }}>
                  <FontAwesome name="pencil" size={14} color="#3B82F6" />{' '}
                  {delayReason || wo.flag_delay_reason || "Enter delay reason..."}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TextInput
                  placeholder="Enter delay reason..."
                  placeholderTextColor="#999"
                  value={delayReason}
                  onChangeText={setDelayReason}
                  style={{
                    color: textColor,
                    backgroundColor: nightMode ? "#2a2a2a" : "#fff",
                    padding: 8,
                    borderRadius: 6,
                    borderColor: borderColor,
                    borderWidth: 1,
                    marginBottom: 8,
                  }}
                />
                <TouchableOpacity
                  onPress={uploadDelayReason}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? "#ccc" : "#074B7C",
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 6,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>{loading ? "..." : "Submit"}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      )}

      <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: borderColor, paddingTop: 8 }}>
        {wo['Due Date'] && (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <FontAwesome name="clock-o" size={14} color={nightMode ? "#ccc" : "#666"} />
            <Text style={{ color: textColor, fontWeight: "bold", marginLeft: 6 }}>Due at:</Text>
            <Text style={{ color: textColor, marginLeft: 6 }}>
              {/\d{2}:\d{2}/.test(wo['Due Date'])
                ? formatDateTime(wo['Due Date'])
                : `${wo['Due Date']} 12:00 AM`}
            </Text>
          </View>
        )}
        {description && (
          <Text style={{ color: textColor, fontSize: 13, fontStyle: "italic", marginTop: 4 }}>
            ** {description} **
          </Text>
        )}
      </View>
    </View>
  );
};

const Tag = ({ icon, text, bg, color = "#000", nightMode }) => (
  <View style={{
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginTop: 6,
  }}>
    <FontAwesome name={icon} size={14} color={color} />
    <Text style={{
      marginLeft: 6,
      fontSize: 12,
      fontWeight: "bold",
      color: nightMode ? "#111" : color,
    }}>
      {text?.length > 16 ? `${text.slice(0, 16)}...` : text}
    </Text>
  </View>
);

export default RestrictionCard;
