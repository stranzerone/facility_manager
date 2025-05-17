import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { usePermissions } from "../GlobalVariables/PermissionsContext";

const DashboardOptionsScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const cardSize = isTablet ? "48%" : "48%";

  const { ppmAsstPermissions } = usePermissions();
  const assetViewPermission = ppmAsstPermissions?.some((p) => p.includes("R"));
const {setComplaintFilter}   = usePermissions()
  const counts = {
    OW: 5,
    UW: 3,
    ME: 2,
    OC: 4,
    IPC: 6,
  };
  const dashboardOptions = [
    {
      key: "OW",
      label: "Open Work Orders",
      icon: "folder-open",
      color: "#0EA5E9",
      count: counts.OW,
      route:assetViewPermission?"MyWorkOrders":"MyWorkOrders",
      active: true,
    },
    {
      key: "UW",
      label: "Upcoming Work Orders",
      icon: "calendar",
      color: "#22C55E",
      count: counts.UW,
      route: "FutureWorkOrders",
      subroute :"FutureWorkOrders",
      active: true,
    },
    {
      key: "ME",
      label: "My Escalations",
      icon: "exclamation-circle",
      color: "#8B5CF6",
      count: counts.ME,
      route: "MyWorkOrders",
      active: false, // Inactive example
    },
    {
      key: "OC",
      label: "Open Complaints",
      icon: "file-text",
      color: "#14B8A6",
      count: counts.OC,
      route: "ServiceRequests",
      status: "Open",
      active: true,
    },
    {
      key: "IPC",
      label: "In-Progress Complaints",
      icon: "spinner",
      color: "#F97316",
      count: counts.IPC,
      route: "ServiceRequests",
      status: "WIP",
      active: true,
    },
  ];
  

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-6">
      {!ppmAsstPermissions && (
        <View className="flex-row items-start p-4 mb-4 rounded-xl bg-yellow-100 border border-yellow-300 shadow-sm">
          <FontAwesome name="exclamation-triangle" size={24} color="#D97706" />
          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-yellow-800">
              Scan Required
            </Text>
            <Text className="text-sm text-yellow-700 mt-1">
              You need to scan the QR code to view. Simply click on any tab to begin scanning.
            </Text>
          </View>
        </View>
      )}

      <View className="flex-row flex-wrap justify-between">
        {dashboardOptions.map((option) => (
  <Pressable
  key={option.key}
  android_ripple={
    option.active
      ? { color: `${option.color}20`, borderless: false }
      : null
  }
  onPress={() => {
    if (!option.active) return;
    if (option.key === "OC" || option.key === "IPC") {
      setComplaintFilter(option.status);
    }
    navigation.navigate(option.route, {
      screen: option.subroute || "NewScanPage",
      params: { screenType: option.key },
    });
  }}
  disabled={!option.active}
  style={{
    width: cardSize,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
    opacity: option.active ? 1 : 0.4, // Reduce opacity when disabled
    elevation: Platform.OS === "android" ? 3 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  }}
>

            <FontAwesome name={option.icon} size={32} color={option.color} />
            <Text className="text-base font-semibold mt-3 text-black text-center px-2">
              {option.label}
            </Text>

            {/* <View
              className="mt-2 px-3 py-1 rounded-full"
              style={{
                backgroundColor: option.color + "22",
                minWidth: 36,
                minHeight: 36,
                borderRadius: 999,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: option.color, fontWeight: "bold", fontSize: 16 }}>
                {option.count}
              </Text>
            </View> */}
          </Pressable>
        ))}
      </View>

      {/* QR SCANNER BUTTON */}
      <Pressable
        onPress={() =>
          navigation.navigate("QRCode", {
            screen: "NewScanPage",
            params: { screenType: "OW" },
          })
        }
        className="mt-1  self-center bg-[#074B7C] px-6 py-3 rounded-full flex-row items-center shadow-md"
        style={{
          elevation: Platform.OS === "android" ? 4 : 0,
        }}
      >
        <FontAwesome name="qrcode" size={20} color="#fff" />
        <Text className="ml-2 text-white font-semibold text-base">Scan QR Code</Text>
      </Pressable>
    </ScrollView>
  );
};

export default DashboardOptionsScreen;
