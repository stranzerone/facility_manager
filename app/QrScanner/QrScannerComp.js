import  { useState, useCallback } from "react";
import {
  StyleSheet,
  SafeAreaView,
} from "react-native";
import {Camera } from "react-native-camera-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import DynamicPopup from "../DynamivPopUps/DynapicPopUpScreen";
import { usePermissions } from "../GlobalVariables/PermissionsContext";
import { InventoryServices } from "../../services/apis/InventoryApi";

export default function QrScanner({ screenType = "OW" }) {
  const [scanned, setScanned] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("error");

  const navigation = useNavigation();
  const { issueRequestPermission } = usePermissions();
  const permissionToReadInv = issueRequestPermission.some((p) => p.includes("R"));

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, [])
  );

  const isUUID = (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const fetchInvInfo = async (uuid) => {
    try {
      const response = await InventoryServices.getWareHouseStatus();
      const warehouse = response?.data?.find((item) => item.uuid === uuid);
      console.log(warehouse)
      return warehouse?.Active || false;
    } catch (error) {
      console.error("Error retrieving warehouse info:", error.message || error);
      return false;
    }
  };

  const showError = (message) => {
    setPopupMessage(message);
    setPopupType("error");
    setPopupVisible(true);
    setTimeout(() => setScanned(false), 1500);
  };

  const showPopup = (message, type) => {
    setPopupMessage(message);
    setPopupType(type);
    setPopupVisible(true);
    setTimeout(() => setScanned(false), 1500);
  };

  const handleBarcodeScanned = async (event) => {
    const data = event.nativeEvent.codeStringValue;
    setScanned(true);
  
 
  
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (!userInfo) throw new Error('User information not found in AsyncStorage');
  
      const parsedUserInfo = JSON.parse(userInfo);
      const societyId = parsedUserInfo.data.societyId;
  
      switch (true) {
        // QR from Factech App
        case data.includes("app.factech"):
          const lastSegment = data.split("/").pop(); // "290=LC=89a0fe33-b08a-4d71-8062-5a282bdacf8b"

          // Split using '='
          const [siteId, type, uuid] = lastSegment.split("=");
        if(siteId == societyId){
          await AsyncStorage.setItem("uuid", uuid);
          await AsyncStorage.setItem("type", type);
          setScanned(false);
        
          navigation.navigate("MyWorkOrders", { qrValue :uuid, wotype :type , screenType:screenType });
        }else{
          setPopupMessage("QR Code is not related to site. Please scan a valid QR.1");
          setPopupType("error");
          setPopupVisible(true);
          setScanned(false);
        }
          break;
  
        // Simple UUID QR
        case isUUID(data):
          setScanned(false);
          navigation.navigate("MyWorkOrders", { qrValue: data, wotype: "AS",screenType:screenType });
          break;
  
  


          case JSON.parse(data).v == "1": {
            const parsed = JSON.parse(data);
            const uuid = parsed.d;
  
            if (parsed.t === "warehouse" && permissionToReadInv && parsed.s === societyId) {
              const isActive = await fetchInvInfo(uuid);
    
              if (isActive) {
                navigation.navigate("InventoryOptionsScreen", { uuid, type: "warehouse" });
              }  else if (!isActive) {
                setPopupMessage("It seems Warehouse is Inactive");
                setPopupType("hint");
                setPopupVisible(true);
                setScanned(false);
              }
          
            } else if (parsed.s !== societyId) {
              setPopupMessage("QR Code is not related to site. Please scan a valid QR.3");
              setPopupType("error");
              setPopupVisible(true);
              setScanned(false);
            }
            
           
            
            else {
              setPopupMessage("Unauthorized. Need permission to read.");
              setPopupType("error");
              setPopupVisible(true);
              setScanned(false);
            }
            break;
          }
    
  
  
          default:
            setPopupMessage("Invalid QR Code. Please scan a valid QR.");
            setPopupType("error");
            setPopupVisible(true);
            setScanned(false);
          
  
      }


      
  
    } catch (error) {
      console.error("Failed to process QR:", error);
      setScanned(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      {!scanned && (
 <Camera
 scanBarcode={true}
 style={styles.camera}
 onReadCode={handleBarcodeScanned} // optional
 showFrame={true} // (default false) optional, show frame with transparent layer (qr code or barcode will be read on this area ONLY), start animation for scanner, that stops when a code has been found. Frame always at center of the screen
 laserColor='red' // (default red) optional, color of laser in scanner frame
 frameColor='white' // (default white) optional, color of border of scanner frame
/>
      )}
      <DynamicPopup
        visible={popupVisible}
        type={popupType}
        message={popupMessage}
        onOk={() => setPopupVisible(false)}
        onClose={() => setPopupVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#000",
  },
  camera:{
    width:200,
    height:200,
  }
});
