import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Loader from "../LoadingScreen/AnimatedLoader";
import DynamicPopup from "../DynamivPopUps/DynapicPopUpScreen";
import { useNavigation } from "@react-navigation/native";
import { workOrderService } from "../../services/apis/workorderApis";
import { usePermissions } from "../GlobalVariables/PermissionsContext";

const PMList = ({ uuid, type }) => {
  const [pms, setPms] = useState([]);
  const [filteredPms, setFilteredPms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("");
  const [confirmationPopupVisible, setConfirmationPopupVisible] = useState(false);
  const [selectedUuid, setSelectedUuid] = useState(null);

  const { nightMode } = usePermissions();
  const screen = uuid ? "qr" : "no";
  const QrUuid = uuid;
  const navigation = useNavigation();
  const styles = getStyles(nightMode);

  const loadPms = async () => {
    try {
      const response = await workOrderService.getAllPms({ screen: screen, asset_uuid: QrUuid });
      setPms(response.data);
      setFilteredPms(response.data);
    } catch (error) {
      console.error("Error loading PMs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPms();
  }, [uuid]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (pms && query && screen !== "qr") {
      const filteredData = pms.filter((item) =>
        item.Name?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPms(filteredData);
    } else if (pms && query && screen === "qr") {
      const filteredData = pms.filter((item) =>
        item.pm.Name?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPms(filteredData);
    } else {
      setFilteredPms(pms);
    }
  };

  const handleCreatePms = async (uuid) => {
    try {
      const payload = { uuid };
      const response = await workOrderService.createPms(payload);
      setPopupType(response.status);
      if (response.status === "success") {
        navigation.goBack();
      }
      setPopupMessage(response.message);
      setPopupVisible(true);
    } catch (error) {
      setPopupType("error");
      setPopupMessage("Failed to create PMS. Please try again.");
      setPopupVisible(true);
    }
  };

  const showConfirmationPopup = (uuid) => {
    setSelectedUuid(uuid);
    setConfirmationPopupVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Icon name="file-text" size={24} color="#1996D3" />
        <Text style={styles.cardTitle}>{screen === "qr" ? item?.pm?.Name || "Unnamed PM" : item?.Name || "Unnamed PM"}</Text>
      </View>

      <View style={styles.cardRow}>
        <Icon name="cogs" size={20} color="#4CAF50" />
        <Text style={styles.cardText}>
          <Text style={styles.boldText}>Asset:</Text> {screen === "qr" ? item?.asset?.Name || "Assigned" : item?.ass || "Not Assigned"}
        </Text>
      </View>

      <View style={styles.cardRow}>
        <Icon name="tags" size={20} color="#FFA726" />
        <Text style={styles.cardText}>
          <Text style={styles.boldText}>Category:</Text> {screen === "qr" ? item?.category?.Name || "N/A" : item?.cat || "N/A"}
        </Text>
      </View>

      {screen === "no" && (
        <View style={styles.cardRow}>
          <Icon name="map-marker" size={20} color="#F44336" />
          <Text style={styles.cardText}>
            <Text style={styles.boldText}>Location:</Text> {item?.loc || "Unknown"}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={() => showConfirmationPopup(screen === "qr" ? item?.pm._ID : item._ID)}
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>Create</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search PMs by Name"
          placeholderTextColor={nightMode ? "#999" : "#666"}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <Loader />
      ) : filteredPms?.length > 0 ? (
        <FlatList
          data={filteredPms}
          renderItem={renderItem}
          keyExtractor={(item, index) => screen === "qr" ? index.toString() : item._ID}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="exclamation-circle" size={40} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery
              ? "No PMs found. Try a different search."
              : "Search for PMs to create Work Order from PM's."}
          </Text>
        </View>
      )}

      <DynamicPopup
        visible={popupVisible}
        type={popupType}
        message={popupMessage}
        onClose={() => setPopupVisible(false)}
        onOk={() => setPopupVisible(false)}
      />

      <DynamicPopup
        visible={confirmationPopupVisible}
        type="alert"
        message="Are you sure you want to create WO from this PM?"
        onClose={() => setConfirmationPopupVisible(false)}
        onOk={() => {
          setConfirmationPopupVisible(false);
          handleCreatePms(selectedUuid);
        }}
      />
    </View>
  );
};

const getStyles = (nightMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: nightMode ? "#121212" : "#F8F8F8",
      padding: 16,
      // marginBottom: 30,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: nightMode ? "#1E1E1E" : "#FFF",
      borderRadius: 8,
      padding: 8,
      marginBottom: 4,
      borderWidth: 1,
      borderColor: nightMode ? "#444" : "#DDD",
      elevation: 2,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: nightMode ? "#EEE" : "#333",
    },
    loader: {
      marginTop: 16,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    emptyText: {
      marginTop: 8,
      fontSize: 16,
      fontWeight: "900",
      color: nightMode ? "#AAA" : "#666",
      textAlign: "center",
    },
    card: {
      backgroundColor: nightMode ? "#1E1E1E" : "#FFF",
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      elevation: 4,
      borderWidth: 1,
      borderColor: nightMode ? "#444" : "#DDD",
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    cardTitle: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: "bold",
      color: nightMode ? "#FFF" : "#333",
    },
    cardText: {
      marginLeft: 8,
      fontSize: 14,
      color: nightMode ? "#CCC" : "#555",
    },
    boldText: {
      fontWeight: "bold",
      color: nightMode ? "#EEE" : "#333",
    },
    createButton: {
      backgroundColor: "#1996D3",
      paddingVertical: 8,
      borderRadius: 4,
      marginTop: 8,
    },
    createButtonText: {
      color: "#FFF",
      textAlign: "center",
      fontSize: 14,
    },
  });

export default PMList;
