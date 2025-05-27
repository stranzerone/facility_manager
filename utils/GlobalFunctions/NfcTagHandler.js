import { useEffect } from 'react';
import NfcManager, { NfcEvents } from 'react-native-nfc-manager';
import { useNavigation } from '@react-navigation/native';
import { complaintService } from '../../services/apis/complaintApis';

const useNfcTagHandler = ({ setPopupVisible, setPopupMessage, setPopupType }) => {
  const navigation = useNavigation();

  useEffect(() => {
    const onTagDetected = async (tag) => {
      try {
        if (!tag?.id) return;

        const tagId = tag.id.toLowerCase();
        const response = await complaintService.getNfcUuid(tagId);

        if (response.status === 'success') {
          if (response.data && response.data.length > 0) {
            const tagData = response.data[0];

            if (tagData._LABELS?.includes('LOCATION')) {
              setPopupMessage(`Location tag detected. (${tagId})...`);
              setPopupType('success');
              setPopupVisible(true);
              setTimeout(() => setPopupVisible(false), 1500);

              navigation.navigate('MyWorkOrders', {
                qrValue: tagData.uuid,
                wotype: 'LC',
              });
            } else {
              setPopupMessage(`Asset tag detected. (${tagId})...`);
              setPopupType('success');
              setPopupVisible(true);
              setTimeout(() => setPopupVisible(false), 1500);

              navigation.navigate('MyWorkOrders', {
                qrValue: tagData.uuid,
                wotype: 'AS',
              });
            }
          } else {
            setPopupMessage(`No data found for tag ID: ${tagId}.`);
            setPopupType('warning');
            setPopupVisible(true);
          }
        } else {
          setPopupMessage(`Invalid NFC tag or server error. Tag ID: ${tagId}`);
          setPopupType('error');
          setPopupVisible(true);
        }
      } catch (err) {
        console.error('Error processing tag:', err);
        setPopupMessage(`Something went wrong while processing the tag ID: ${tag?.id?.toLowerCase() || 'unknown'}.`);
        setPopupType('error');
        setPopupVisible(true);
      }
    };

    const startNfc = async () => {
      try {
        const isSupported = await NfcManager.isSupported();
        if (!isSupported) return;

        await NfcManager.start();
        const isEnabled = await NfcManager.isEnabled();
        if (!isEnabled) return;

        NfcManager.setEventListener(NfcEvents.DiscoverTag, onTagDetected);
        await NfcManager.registerTagEvent();
      } catch (err) {
        console.error('NFC init error:', err);
      }
    };

    startNfc();

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.unregisterTagEvent().catch(console.error);
    };
  }, [navigation, setPopupVisible, setPopupMessage, setPopupType]);
};

export default useNfcTagHandler;
