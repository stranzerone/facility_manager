import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { workOrderService } from "../../services/apis/workorderApis";
import { usePermissions } from "../GlobalVariables/PermissionsContext";
import Tag from "./tag";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RestrictionCard = ({ wo, restricted, restrictedTime, description, onUpdate }) => {
  const { nightMode } = usePermissions();
  const [delayReason, setDelayReason] = useState(wo.delay_reason || "");
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [collapsed, setCollapsed] = useState(true);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const getCategoryInfo = async () => {
      try {
        const response = await workOrderService.getCategories();
        const cat = response.data?.find((item) => item.uuid == wo.category_uuid);
        setCategory(cat?.Name);
      } catch (error) {
        console.error(error);
      }
    };
    getCategoryInfo();
  }, []);

const formatRestrictedTime = (time) => {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  const totalHours = hours + minutes / 60;
  if (totalHours >= 48) {
    const days = Math.floor(totalHours / 24);
    return `${days} day${days > 1 ? "s" : ""} `;
  } else if (totalHours >= 24) {
    return "1 day ";
  } else if (totalHours >= 1) {
    return `${Math.floor(totalHours)} hour${Math.floor(totalHours) > 1 ? "s" : ""} `;
  } else {
    return `${minutes} minute${minutes > 1 ? "s" : ""} `;
  }
};
  const formattedTime = formatRestrictedTime(restrictedTime);

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

  const toggleExpanded = () => {
    // Configure smooth animation
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
      delete: { type: 'easeInEaseOut', property: 'opacity' }
    });

    // Animate the chevron rotation
    Animated.timing(rotateAnim, {
      toValue: collapsed ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setCollapsed(!collapsed);
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

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={{
      backgroundColor: bgColor,
      borderColor: borderColor,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
      overflow: 'hidden',
    }}>
      {/* Header - Always visible */}
      <View style={{ 
        flexDirection: "row", 
        alignItems: "center", 
        marginBottom: collapsed ? 12 : 8,
        paddingBottom: collapsed ? 0 : 8,
        borderBottomWidth: collapsed ? 0 : 1,
        borderBottomColor: borderColor,
      }}>
        <FontAwesome name="tag" size={16} color="#074B7C" />
        <Text style={{ 
          marginLeft: 6, 
          fontWeight: "bold", 
          fontSize: 16, 
          color: textColor,
          flex: 1,
        }}>
          {wo.Name}
        </Text>
        {/* Quick status indicator when collapsed */}
        {collapsed && restricted && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome name="stop-circle" size={14} color="red" />
            <Text style={{ color: "red", fontSize: 12, marginLeft: 4 }}>Restricted</Text>
          </View>
        )}
      </View>

      {/* Expandable content */}
      {!collapsed && (
        <View>
          {/* Tags */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
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

          {/* Restriction block */}
          {restricted && (
            <>
              <View style={{ marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <FontAwesome name="stop-circle" size={18} color="red" />
                <Text style={{ color: "red", fontWeight: "bold", marginLeft: 6 }}>Restriction Applied</Text>
              </View>

              <View style={{
                backgroundColor: secondaryBg,
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
              }}>
                {!showInput ? (
                  <TouchableOpacity onPress={() => setShowInput(true)}>
                    <Text style={{ fontWeight: "bold", color: textColor }}>Delay Reason</Text>
                    <Text style={{ color: nightMode ? "#bbb" : "#555", marginTop: 4 }}>
                      <FontAwesome name="pencil" size={14} color="#3B82F6" />{" "}
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

          {/* Footer */}
          <View style={{ borderTopWidth: 1, borderTopColor: borderColor, paddingTop: 8 }}>
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
      )}

      {/* Pull down toggle at bottom */}
      <TouchableOpacity
        onPress={toggleExpanded}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 12,
          backgroundColor: secondaryBg,
          borderRadius: 6,
          marginTop: collapsed ? 0 : 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Text style={{ 
          color: textColor, 
          fontWeight: "600", 
          marginRight: 8,
          fontSize: 14,
        }}>
          {collapsed ? "Show Details" : "Hide Details"}
        </Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <FontAwesome name="chevron-down" size={14} color={textColor} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default RestrictionCard;