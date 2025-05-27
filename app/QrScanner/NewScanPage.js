import { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QrScanner from "./QrScannerComp";
import { useNavigation } from "@react-navigation/native";
import { usePermissions } from "../GlobalVariables/PermissionsContext";
import { workOrderService } from "../../services/apis/workorderApis";

export default function MainScannerPage({ route }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [hasPermission, setPermission] = useState(false);

  const { ppmAsstPermissions, nightMode } = usePermissions();
  const navigation = useNavigation();

  const colors = {
    background: nightMode ? "#121212" : "#EAF2F8",
    cardBg: nightMode ? "#1e1e1e" : "#fff",
    text: nightMode ? "#e0e0e0" : "#074B7C",
    subText: nightMode ? "#aaa" : "#666",
    border: nightMode ? "#2f2f2f" : "#074B7C",
    icon: "#074B7C",
  };

  useEffect(() => {
    if (ppmAsstPermissions?.some((permission) => permission.includes("R"))) {
      setPermission(true);
    }

    const fetchAssetOptions = async () => {
      try {
        setLoading(true);
        const response = await workOrderService.getQrAssets();
        const data = Array.isArray(response?.data)
          ? response.data.map((item, index) => ({
              id: item._ID || index.toString(),
              label: item.Name || "Unnamed Asset",
              value: item.Name || "Unnamed Asset",
              uuid: item.uuid || "",
            }))
          : [];

        setOptions(data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetOptions();
  }, []);

  const handleAssetSelect = (item) => {
    setShowOptions(false);
    navigation.navigate("MyWorkOrders", { qrValue: item.uuid, wotype: "AS" });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View className="h-[10%]">
        {hasPermission && (
          <TouchableOpacity
            className="bg-[#074B7C] font-black"
            style={[styles.assetButton, { borderColor: colors.border }]}
            onPress={() => setShowOptions(!showOptions)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Select Asset</Text>
            <Ionicons
              name={showOptions ? "chevron-down" : "chevron-forward"}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        )}
      </View>

      {loading && hasPermission ? (
        <ActivityIndicator size="large" color={colors.text} style={styles.loadingIndicator} />
      ) : showOptions ? (
        <View
          className="rounded-lg shadow-md p-1 mt-1"
          style={{ backgroundColor: colors.cardBg }}
        >
          <FlatList
            data={options}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center gap-2 p-3 mb-2 border-b-2 rounded-lg shadow-md"
                style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
                onPress={() => handleAssetSelect(item)}
              >
                <Ionicons name="cube" size={15} color={colors.icon} />
                <Text
                  className="text-lg font-medium flex-1"
                  style={{ color: colors.subText }}
                >
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={[styles.noDataText, { color: colors.text }]}>
                No assets found
              </Text>
            }
          />
        </View>
      ) : null}

      <View>
        <View
          className="mt-10 flex flex-col items-center justify-center"
          style={styles.cameraContainer}
        >
          <QrScanner screenType={route?.params?.screenType || "OW"} />
        </View>

        <View className="flex flex-col items-center justify-center">
          <Ionicons name="qr-code-outline" size={100} color={colors.icon} />
          <Text className="mt-24" style={[styles.instructions, { color: colors.text }]}>
            Scan QR code or select asset from above
          </Text>
        </View>
      </View>

      <View></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  assetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 0,
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    padding: 10,
  },
  instructions: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 20,
  },
  loadingIndicator: {
    padding: 20,
  },
  cameraContainer: {
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#074B7C",
    alignItems: "center",
    justifyContent: "center",
  },
});
