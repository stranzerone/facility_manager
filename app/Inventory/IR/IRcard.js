import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { usePermissions } from "../../GlobalVariables/PermissionsContext";

const getStatusColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "#22C55E";
    case "PENDING":
      return "#FACC15";
    case "DECLINED":
    case "CANCELLED":
      return "#EF4444";
    case "DRAFT":
      return "#A5B4FC";
    default:
      return "#CBD5E1";
  }
};

const IRCard = ({ item, uuid }) => {
  const issue = item.issue || {};
  const { nightMode } = usePermissions();
  
  const sequenceNo = issue["Sequence No"] || "N/A";
  const statusName = issue.Status || "Unknown";
  const createdAt = issue.created_at?.split(" ")[0] || "-";
  const statusColor = getStatusColor(statusName);
  const itemNames = item.item?.map((i) => i.Name).join(", ") || "Unnamed Item";
  
  const navigation = useNavigation();
  
  // Dynamic styles based on night mode
  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: nightMode ? "#1F2937" : "white",
      borderRadius: 12,
      marginBottom: 12,
      flexDirection: "row",
      overflow: "hidden",
      // Enhanced shadows
      elevation: 4,
      shadowColor: nightMode ? "#000" : "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: nightMode ? 0.4 : 0.15,
      shadowRadius: 6,
    },
    sequenceNumber: {
      fontSize: 16,
      fontWeight: "700",
      color: nightMode ? "#F9FAFB" : "#1E293B",
    },
    itemNames: {
      fontSize: 13,
      color: nightMode ? "#D1D5DB" : "#334155",
      fontWeight: "500",
      lineHeight: 18,
      paddingLeft: 20,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: nightMode ? "#374151" : "#F1F5F9",
    },
    sequenceLabel: {
      fontSize: 12,
      color: nightMode ? "#9CA3AF" : "#64748B",
      fontWeight: "500",
      marginRight: 4,
    },
    itemLabel: {
      marginLeft: 6,
      fontSize: 12,
      color: nightMode ? "#9CA3AF" : "#64748B",
      fontWeight: "500",
    },
    dateText: {
      marginLeft: 6,
      fontSize: 12,
      color: nightMode ? "#9CA3AF" : "#64748B",
    },
  });
  
  return (
    <Pressable
      onPress={() => navigation.navigate("IrDetail", { item, uuid, issueUuid: issue.uuid })}
      style={dynamicStyles.card}
    >
      {/* Status Indicator Line */}
      <View style={[styles.statusLine, { backgroundColor: statusColor }]} />
      
      <View style={styles.cardContent}>
        {/* Top Row: Sequence No + Status */}
        <View style={styles.header}>
          <View style={styles.sequenceContainer}>
            <Text style={dynamicStyles.sequenceLabel}></Text>
            <Text style={dynamicStyles.sequenceNumber}>{sequenceNo}</Text>
          </View>
          
          <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusName}</Text>
          </View>
        </View>
        
        {/* Middle: Item Names */}
        <View style={styles.itemSection}>
          <View style={styles.itemHeader}>
            <FontAwesome 
              name="cube" 
              size={14} 
              color={nightMode ? "#9CA3AF" : "#64748B"} 
            />
            <Text style={dynamicStyles.itemLabel}>Items</Text>
          </View>
          <Text style={dynamicStyles.itemNames} numberOfLines={1} ellipsizeMode="tail">
            {itemNames}
          </Text>
        </View>
        
        {/* Bottom: Created Date */}
        <View style={dynamicStyles.footer}>
          <FontAwesome 
            name="calendar" 
            size={12} 
            color={nightMode ? "#6B7280" : "#94A3B8"} 
          />
          <Text style={dynamicStyles.dateText}>{createdAt}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  statusLine: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sequenceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemSection: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
});

export default IRCard;