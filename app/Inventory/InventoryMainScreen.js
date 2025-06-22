import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { InventoryServices } from "../../services/apis/InventoryApi";
import { usePermissions } from "../GlobalVariables/PermissionsContext";

const options = [
  { id: "IR", label: "Issue Request", icon: "exchange", enabled: true, color: "#1996D3" },
  { id: "IO", label: "Issue Order", icon: "truck", enabled: false, color: "#F97316" },
  { id: "PO", label: "Purchase Order", icon: "shopping-cart", enabled: false, color: "#22C55E" },
  { id: "PR", label: "Purchase Request", icon: "file-text", enabled: false, color: "#E11D48" },
];

// Colors based on nightMode
const getColors = (nightMode) => ({
  background: nightMode ? '#121212' : '#ffffff',
  cardBackground: nightMode ? '#1e1e1e' : '#ffffff',
  infoBg: nightMode ? '#2c2c2c' : '#F1F5F9',
  primaryText: nightMode ? '#f8f9fa' : '#074B7C',
  secondaryText: nightMode ? '#b0b0b0' : '#6b7280',
  borderColor: nightMode ? '#404040' : '#e5e7eb',
  shadowColor: nightMode ? '#000000' : '#000000',
  buildingIcon: nightMode ? '#f8f9fa' : '#074B7C',
  cardText: nightMode ? '#f8f9fa' : '#000000',
});

const InventoryOptionsScreen = ({ route }) => {
  const uuid = route?.params?.uuid || null;
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const cardSize = isTablet ? "30%" : "47%";
  const [invInfo, setInvInfo] = useState(null);
  const { nightMode } = usePermissions();
  const colors = getColors(nightMode);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await InventoryServices.getWareHouseStatus();
        setInvInfo(response?.data?.find((item) => item.uuid === uuid) || {});
      } catch (error) {
        console.error(error.message || error, 'error while retrieving warehouse info');
      }
    };

    fetchData();
  }, [uuid]);

  const navigation = useNavigation();

  return (
    <ScrollView 
      style={{ 
        flex: 1, 
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingTop: 24
      }}
    >
      {/* Info Card */}
      <View 
        style={{
          marginBottom: 24,
          backgroundColor: colors.infoBg,
          padding: 16,
          borderRadius: 12,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: Platform.OS === "android" ? 2 : 0,
          borderWidth: 1,
          borderColor: colors.borderColor,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <FontAwesome 
            name="building-o" 
            size={20} 
            color={colors.buildingIcon} 
          />
          <Text 
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              marginLeft: 8,
              color: colors.primaryText,
            }}
          >
            {invInfo?.Name || "Inventory"}
          </Text>
        </View>

        {invInfo?.Description ? (
          <View style={{ maxHeight: 80, overflow: 'hidden' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  color: colors.secondaryText,
                  fontSize: 14,
                }}
              >
                {invInfo.Description}
              </Text>
            </ScrollView>
          </View>
        ) : (
          <Text 
            style={{ 
              color: colors.secondaryText, 
              fontSize: 14, 
              marginTop: 4 
            }}
          >
            No Description Available
          </Text>
        )}
      </View>

      {/* Options Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            android_ripple={{ 
              color: nightMode ? `${option.color}30` : `${option.color}20`, 
              borderless: false 
            }}
            onPress={() => navigation.navigate("IssuedRequests", { uuid: uuid })}
            disabled={!option.enabled}
            style={{
              width: cardSize,
              marginBottom: 16,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.borderColor,
              backgroundColor: colors.cardBackground,
              justifyContent: "center",
              alignItems: "center",
              aspectRatio: 1,
              opacity: option.enabled ? 1 : 0.4,
              elevation: Platform.OS === "android" ? 2 : 0,
              shadowColor: colors.shadowColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: nightMode ? 0.3 : 0.05,
              shadowRadius: 4,
            }}
          >
            <FontAwesome 
              name={option.icon} 
              size={32} 
              color={option.color} 
            />
            <Text
              style={{
                fontSize: 24,
                fontWeight: '900',
                marginTop: 8,
                color: colors.cardText,
              }}
            >
              {option.id}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.cardText,
                fontWeight: 'bold',
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

export default InventoryOptionsScreen;