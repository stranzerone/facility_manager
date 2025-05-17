import React, { useEffect, useState } from 'react';
import { View, Linking, Text } from 'react-native';
import DynamicPopup from '../DynamivPopUps/DynapicPopUpScreen';
import GetAppUpdate from '../../service/NfcTag/GetAppUpdate';

const UpdateAppScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  // Function to open Play Store
  const redirectToPlayStore = () => {
    const packageName = 'com.sumasamu.isocietyManagerAdmin'; // Replace with your actual package name
    const playStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
    Linking.openURL(playStoreUrl).catch(err => console.error("Failed to open URL:", err));
  };


const getAppVersion = async()=>{

  try{

 const response = await GetAppUpdate()

 if(response.status=="error")
   setModalVisible(true)
}catch(error){
    console.error(error)
  }

}

  useEffect(()=>{

    getAppVersion()
  },[])

  return (
    <View style={{  justifyContent: 'center', alignItems: 'center',backfaceVisibility:"hidden" }}>
   

      {/* Dynamic Popup */}
      <DynamicPopup
        visible={modalVisible}
        type="hint"
        message={<Text style={{ fontWeight: 'bold' }}>A new version of the app is available. Click OK to download it from the Play Store.</Text>}
        onClose={() => setModalVisible(false)}
        onOk={() => {
          setModalVisible(false);
          redirectToPlayStore();
        }}
      />
    </View>
  );
};

export default UpdateAppScreen;
