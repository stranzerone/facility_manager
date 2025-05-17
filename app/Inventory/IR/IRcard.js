import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";

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
  
  const sequenceNo = issue["Sequence No"] || "N/A";
  const statusName = issue.Status || "Unknown";
  const createdAt = issue.created_at?.split(" ")[0] || "-";
  const statusColor = getStatusColor(statusName);
  const itemNames = item.item?.map((i) => i.Name).join(", ") || "Unnamed Item";
  
  const navigation = useNavigation();
  
  return (
    <Pressable
      onPress={() => navigation.navigate("IrDetail", { item, uuid, issueUuid: issue.uuid })}
      style={styles.card}
    >
      {/* Status Indicator Line */}
      <View style={[ { backgroundColor: statusColor }]} />
      
      <View style={styles.cardContent}>
        {/* Top Row: Sequence No + Status */}
        <View style={styles.header}>
          <View style={styles.sequenceContainer}>
            <Text style={styles.sequenceLabel}></Text>
            <Text style={styles.sequenceNumber}>{sequenceNo}</Text>
          </View>
          
          <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusName}</Text>
          </View>
        </View>
        
        {/* Middle: Item Names */}
        <View style={styles.itemSection}>
          <View style={styles.itemHeader}>
            <FontAwesome name="cube" size={16} color="#64748B" />
            <Text style={styles.itemLabel}>Items</Text>
          </View>
          <Text style={styles.itemNames} numberOfLines={2} ellipsizeMode="tail">
            {itemNames}
          </Text>
        </View>
        
        {/* Bottom: Created Date */}
        <View style={styles.footer}>
          <FontAwesome name="calendar" size={14} color="#94A3B8" />
          <Text style={styles.dateText}>{createdAt}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusLine: {

  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sequenceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sequenceLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    marginRight: 4,
  },
  sequenceNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemSection: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  itemLabel: {
    marginLeft: 6,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  itemNames: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
    lineHeight: 20,
    paddingLeft: 22,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  dateText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#64748B",
  },
});

export default IRCard;