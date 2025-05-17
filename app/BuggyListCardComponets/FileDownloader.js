import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

const handleDownload = async ({ file }) => {

  try {
    // Define the local path where the file will be saved
    const fileUri = `${FileSystem.documentDirectory}${file.split('/').pop()}`;

    // Download the file from AWS S3
    const downloadResumable = FileSystem.createDownloadResumable(
      file, // This is the URL passed as a prop
      fileUri
    );

    // Execute the download
    const { uri } = await downloadResumable.downloadAsync();

    // Check if the file exists at the specified location
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {

      // Check if the file can be shared
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri); // Share the downloaded PDF file
        Alert.alert('Download complete', 'PDF has been downloaded and shared.');
      } else {
        Alert.alert('Sharing not available', 'PDF downloaded but cannot be shared.');
      }
    } else {
      Alert.alert('Error', 'The downloaded file does not exist.');
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    Alert.alert('Download failed', 'Unable to download the PDF. Please try again later.');
  }
};

export default handleDownload;
