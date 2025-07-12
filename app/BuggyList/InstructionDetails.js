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
    
     
      setShowInput(false);
      Alert.alert("Success", "Delay reason updated successfully.");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const textColor = nightMode ? "#eee" : "#074B7C";
  const bgColor = nightMode ? "#1a1a1a" : "#87CEFA1A";
  const borderColor = nightMode ? "#333" : "#e2e8f0";
  const secondaryBg = nightMode ? "#2a2a2a" : "#ffffff";

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={{
      backgroundColor: bgColor,
      borderColor: borderColor,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      position: 'relative',
    }}>
      {/* Header - Always visible */}
      <View style={{ 
        flexDirection: "column", 
        alignItems: "flex-start", 
        justifyContent: "center",
        marginBottom: collapsed ? 8 : 12,
        paddingBottom: collapsed ? 0 : 12,
        borderBottomWidth: collapsed ? 0 : 1,
        borderBottomColor: borderColor,
        paddingRight: 40, // Space for the circular button
      }}>
        <View style={{ 
          flexDirection: "row", 
          alignItems: "center", 
          marginBottom: 6,
        }}>
          <Text style={{ 
            fontWeight: "900", 
            fontSize: 16, 
            color: textColor,
            marginLeft: 8,
            flex: 1,
          }}>
   {wo["Sequence No"]} - {wo.Name}
          </Text>
        </View>
        
             {restricted && <View style={{
                backgroundColor: secondaryBg,
                width:"110%",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: borderColor,
              }}>
                {!showInput  ? (
                  <TouchableOpacity onPress={() => setShowInput(true)}>
                    <Text style={{ 
                      fontWeight: "600", 
                      color: textColor,
                      marginBottom: 4 
                    }}>
                      Delay Reason
                    </Text>
                    <Text style={{ 
                      color: nightMode ? "#bbb" : "#64748b", 
                      fontSize: 14,
                      lineHeight: 20
                    }}>
                      <FontAwesome name="pencil" size={14} color="#3B82F6" />{" "}
                      {delayReason || wo.flag_delay_reason || "Tap to enter delay reason..."}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TextInput
                      placeholder="Enter delay reason..."
                      placeholderTextColor="#9ca3af"
                      value={delayReason}
                      onChangeText={setDelayReason}
                      multiline
                      style={{
                        color: textColor,
                        backgroundColor: nightMode ? "#2a2a2a" : "#fff",
                        padding: 12,
                                        width:"100%",

                        borderRadius: 8,
                        borderColor: borderColor,
                        borderWidth: 1,
                        marginBottom: 10,
                        minHeight: 60,
                        textAlignVertical: 'top',
                      }}
                    />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={uploadDelayReason}
                        disabled={loading}
                        style={{
                          backgroundColor: loading ? "#9ca3af" : "#074B7C",
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          borderRadius: 6,
                          flex: 1,
                        }}
                      >
                        <Text style={{ 
                          color: "#fff", 
                          fontWeight: "600",
                          textAlign: 'center'
                        }}>
                          {loading ? "Submitting..." : "Submit"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setShowInput(false)}
                        style={{
                          backgroundColor: nightMode ? "#374151" : "#f3f4f6",
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ 
                          color: nightMode ? "#d1d5db" : "#374151", 
                          fontWeight: "600"
                        }}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>}
        {/* Quick status indicator when collapsed */}
        {collapsed && restricted && (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            justifyContent:"center",
            marginTop: 4,
          }}>
            <FontAwesome name="stop-circle" size={14} color="#ef4444" />
            <Text style={{ 
              textAlign:'center',
              color: "#ef4444", 
              fontSize: 12, 
              marginLeft: 4,
              fontWeight: "500"
            }}>
              Restriction Applied
            </Text>
            
          </View>
          
        )}
      </View>

      {/* Expandable content */}
      {!collapsed && (
        <View style={{ paddingRight: 4 }}>
          {/* Tags */}
          <View style={{ 
            flexDirection: "row", 
            flexWrap: "wrap", 
            gap: 2, 
            marginBottom: 12 
          }}>
            <Tag icon="user" text={wo["Sequence No"]} nightMode={nightMode} bg="lightblue" />
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
              <View style={{ 
                marginBottom: 12, 
                flexDirection: "row", 
                alignItems: "center", 
                justifyContent: "flex-start" 
              }}>
                <FontAwesome name="stop-circle" size={18} color="#ef4444" />
                <Text style={{ 
                  color: "#ef4444", 
                  fontWeight: "600", 
                  marginLeft: 8 
                }}>
                  Restriction Applied
                </Text>
              </View>

            </>
          )}

          {/* Footer */}
          <View style={{ 
            borderTopWidth: 1, 
            borderTopColor: borderColor, 
            paddingTop: 12 
          }}>
            {wo['Due Date'] && (
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                marginBottom: 6 
              }}>
                <FontAwesome name="clock-o" size={14} color={nightMode ? "#9ca3af" : "#6b7280"} />
                <Text style={{ 
                  color: textColor, 
                  fontWeight: "600", 
                  marginLeft: 8 
                }}>
                  Due:
                </Text>
                <Text style={{ 
                  color: nightMode ? "#d1d5db" : "#374151", 
                  marginLeft: 6,
                  fontSize: 14
                }}>
                  {/\d{2}:\d{2}/.test(wo['Due Date'])
                    ? formatDateTime(wo['Due Date'])
                    : `${wo['Due Date']} 12:00 AM`}
                </Text>
              </View>
            )}
            {description && (
              <Text style={{ 
                color: nightMode ? "#9ca3af" : "#6b7280", 
                fontSize: 13, 
                fontStyle: "italic", 
                marginTop: 6,
                lineHeight: 18
              }}>
                ** {description} **
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Circular toggle button - positioned at bottom right */}
<TouchableOpacity
  onPress={toggleExpanded}
  style={{
    position: 'absolute',
    right: 12,
    bottom: 12,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#074B7C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  }}
>
  <Animated.View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    <Text style={{ color: '#fff', fontSize: 12, marginRight: 6 }}>
      {!collapsed ? 'Hide Details' : 'Show Details'}
    </Text>
    <FontAwesome 
      name="chevron-down" 
      size={10} 
      color="#ffffff" 
    />
  </Animated.View>
</TouchableOpacity>
    </View>
  );
};

export default RestrictionCard;