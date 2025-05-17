
const convertBlobToBase64 = (blob) => {

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // Get the Base64 result
    reader.onerror = reject;
    reader.readAsDataURL(blob); // Read the Blob data as a Base64 encoded URL
  });
};

const convertUrlToBase64 = async (imageUrl) => {
  try {
    // Fetch the image from the URL as a Blob
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Convert the response to a Blob
    const blob = await response.blob();

    // Convert Blob to Base64
    const base64Url = await convertBlobToBase64(blob);

    return base64Url;
  } catch (error) {
    console.error('Error converting URL to Base64:', error);
    return null;
  }
};

export default convertUrlToBase64;
