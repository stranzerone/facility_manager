import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UpdateInstructionApi } from '../BuggyListApis/UpdateInstructionApi';
import { API_URL3 } from '@env';

export const uplodPdfToServer = async (data, itemId, WoUuId) => {

  try {
    // Fetch user information from AsyncStorage
    const userInfo = await AsyncStorage.getItem('userInfo');
    if (!userInfo) {
      console.error('User information not found in AsyncStorage');
      return false;
    }

    const parsedUserInfo = JSON.parse(userInfo);
    const userId = parsedUserInfo?.data?.id;
    const apiToken = parsedUserInfo?.data?.api_token;
    const societyId = parsedUserInfo.data.societyId;

    // Validate user information
    if (!userId || !apiToken) {
      console.error('Invalid user data found', parsedUserInfo);
      return false;
    }

    // API URL for image upload
    // const apiUrl = `https://drs-api.isocietymanager.com/v1/society/${societyId}/publicupload`;

    // Create FormData object for the image file
    const formData = new FormData();
    formData.append('name', data.fileName || data.name.split(".")[0]); // File name
    formData.append('type', data.mimeType); // MIME type (e.g., image/jpeg)
    formData.append('file', {
      uri: data.uri,
      name: data.fileName || data.name.split(".")[0], // File name or fallback
      type: data.mimeType, // MIME type (e.g., image/jpeg)
    });


    // Append user-id and api-token to the form data
    formData.append('user-id', userId);
    formData.append('api-token', apiToken);

    // Make the POST request to upload the image
    const response = await axios.post(`${API_URL3}/v1/society/${societyId}/publicupload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Correct header for file upload
      },
    });

    // Handle the response from the image upload
    if (response.data.status === 'success') {

      // Call UpdateInstructionApi with the image URL and metadata
      const updateInstResponse = await UpdateInstructionApi({
        id: itemId,
        value: response.data.data.url, // Uploaded image URL
        remark : null,
        type: data.mimeType, // File MIME type
        WoUuId: WoUuId,
      });

      // If UpdateInstructionApi call was successful, return true
      if (updateInstResponse) {
        return true;
      }
      return false;
    } else {
      console.error('Error in image upload:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('Error uploading image:', error.message);
    return false;
  }
};
