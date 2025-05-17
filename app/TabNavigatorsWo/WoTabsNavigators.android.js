import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {useNavigation } from '@react-navigation/native';
import WorkOrdersMainScreen from '../WorkOrderStack/WoDynamicTabScreen';
import BuggyListTopTabs from '../BuggyListTopTabs/BuggyListTopTabs';
import WorkOrderHomeTab from '../WorkOrderStack/WoDynamicTabScreen';
import NfcManager, { NfcEvents } from 'react-native-nfc-manager';
import GetUuIdForTag from '../../service/NfcTag/GetUuId';
import { useEffect,useState } from 'react';
import { Text, View } from 'react-native';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
const Stack = createStackNavigator();


// Main stack navigator for your application
const WorkOrderStack = () => {
  const navigation = useNavigation();
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); // To dynamically set the message in the popup
const [modelType,setModelType]  = useState('warning')
  useEffect(() => {
    const initNfc = async () => {
      try {
        const isSupported = await NfcManager.isSupported();
        if (!isSupported) {
          return;
        }

        await NfcManager.start(); // Initialize NFC
        const isEnabled = await NfcManager.isEnabled();
        setNfcEnabled(isEnabled);

        if (!isEnabled) {
          console.log("NFC is not enabled on this device.");
        }

        await NfcManager.setEventListener(NfcEvents.DiscoverTag, onTagDetected);
        await NfcManager.registerTagEvent();
      } catch (error) {
        console.error("Error initializing NFC:", error);
      }
    };

    initNfc();

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.unregisterTagEvent().catch((err) =>
        console.error("Error unregistering NFC tag event:", err)
      );
    };
  }, []);

  const onTagDetected = async (tag) => {
    try {
      if (!tag || !tag.id) {
        return;
      }
      const response = await GetUuIdForTag(tag.id.toLowerCase());
      setModalVisible(true);

      setModelType("success")
      setModalMessage(<>Tag <Text style={{ fontWeight: 'bold' }}>${tag.id.toLowerCase()}</Text> detected Successfully</>);

      if (response.status === "success") {
        const count = response.metadata?.count;
        if (count == "0") {
          setModelType("warning")

          setModalMessage( <>
    It seems tag <Text style={{ fontWeight: 'bold' }}> {tag.id.toLowerCase()}</Text> is not associated with any asset or location.
  </>);
          setModalVisible(true);
        } else {
          const siteUuid = response.data[0]?.uuid;
          if (!siteUuid) {
            return;
          }

          if (response.data[0]._LABELS.includes("LOCATION")) {
            navigation.navigate("ScannedWoTag", { uuid: response.data[0].uuid, type: "LC" });
          } else {
            navigation.navigate("ScannedWoTag", { uuid: response.data[0].uuid, type: "AS" });
          }
        }
      } else {
        console.log("Invalid NFC tag or response");
      }
    } catch (error) {
      console.error("Error while detecting tag:", error);
      Alert.alert("Error", "Something went wrong while processing the tag. Please try again.");
    }
  };

  return (
    <>
      <Stack.Navigator
        initialRouteName="Work Order List"
        screenOptions={{
          headerShown: false, // Hide header if not needed
        }}
      >
        <Stack.Screen name="Work Order List" component={WorkOrdersMainScreen} />
        <Stack.Screen name="BuggyList" component={BuggyListTopTabs} />
        <Stack.Screen name="DynamicWo" component={WorkOrderHomeTab} />
      </Stack.Navigator>
      {/* Conditionally render the DynamicPopup */}
      {modalVisible && (
        <DynamicPopup
          visible={modalVisible}
          type={modelType}
          message={modalMessage}
          onClose={() => setModalVisible(false)}
          onOk={() => {
            setModalVisible(false);
          }}
        />
      )}
    </>
  );
};

export default WorkOrderStack;
