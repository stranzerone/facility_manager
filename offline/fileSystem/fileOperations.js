import * as FileSystem from 'expo-file-system';
export const writeToFile = async (fileName, data) => {
  try {
    const fileUri = FileSystem.documentDirectory + fileName;
    const stringifiedData = JSON.stringify(data); // ✅ Convert object to string

    await FileSystem.writeAsStringAsync(fileUri, stringifiedData, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch (error) {
    console.error('❌ Error writing to file:', error);
  }
};


export const readFromFile = async (fileName) => {
  try {
    const fileUri = FileSystem.documentDirectory + fileName;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      console.warn(`⚠️ File not found: ${fileUri}`);
      return null;
    }

    const content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });    
    // ✅ Parse string back to original object/array
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Error reading file:', error);
    return null;
  }
};

export const saveQueue = async (name, queue) => {
  const QUEUE_FILE_PATH = `${FileSystem.documentDirectory}${name}.json`;
  try {
    await FileSystem.writeAsStringAsync(QUEUE_FILE_PATH, JSON.stringify(queue));
    console.log("✅ Queue saved");
  } catch (error) {
    console.log("❌ Error saving queue", error);
  }
};

export const saveImage = async (uri, filename) => {
  const dest = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.copyAsync({
    from: uri,
    to: dest,
  });
  return dest; // Return the new local URI
};

export const addToQueue = async (name, data) => {
  const QUEUE_FILE_PATH = `${FileSystem.documentDirectory}${name}.json`;

  try {
    const existing = await FileSystem.readAsStringAsync(QUEUE_FILE_PATH).catch(() => '[]');
    const queue = JSON.parse(existing);
    queue.push(data);
    await FileSystem.writeAsStringAsync(QUEUE_FILE_PATH, JSON.stringify(queue));
    console.log("✅ Added to queue");
  } catch (error) {
    console.log("❌ Error in addToQueue", error);
  }
};


export const removeFromQueue = async (name, data) => {
  const QUEUE_FILE_PATH = `${FileSystem.documentDirectory}${name}.json`;

  try {
    const existing = await FileSystem.readAsStringAsync(QUEUE_FILE_PATH).catch(() => '[]');
    let queue = JSON.parse(existing);

    // Filter out the matching item (based on URL and payload)
    const filteredQueue = queue.filter(
      item => !(item.url === data.url && JSON.stringify(item.payload) === JSON.stringify(data.payload))
    );

    await FileSystem.writeAsStringAsync(QUEUE_FILE_PATH, JSON.stringify(filteredQueue));
    console.log("🗑️ Removed item from queue:", data.url);
  } catch (error) {
    console.log("❌ Error removing from queue:", error);
  }
};

export const getQueueLength = async (name) => {
  const QUEUE_FILE_PATH = `${FileSystem.documentDirectory}${name}.json`;

  try {
    const existing = await FileSystem.readAsStringAsync(QUEUE_FILE_PATH);
    const queue = JSON.parse(existing);
    return queue.length;
  } catch (error) {
    console.log("❌ Error reading queue length:", error);
    return 0;
  }
};

export const getQueue = async (name) => {
  console.log("getting queue for sync")
  const QUEUE_FILE_PATH = `${FileSystem.documentDirectory}${name}.json`;

  try {
    const content = await FileSystem.readAsStringAsync(QUEUE_FILE_PATH);
    return JSON.parse(content);
  } catch {
    return [];
  }
};

export const clearQueue = async (name) => {
  const QUEUE_FILE_PATH = `${FileSystem.documentDirectory}${name}.json`;
  console.log(QUEUE_FILE_PATH,'this queue is cleared')

  try {
    await FileSystem.writeAsStringAsync(QUEUE_FILE_PATH, JSON.stringify([]));
    console.log(QUEUE_FILE_PATH,'this is clared file')
  } catch (error) {
    console.log("❌ Error clearing queue", error);
  }
};


export const deleteFile = async (filename) => {
  const QUEUE_FILE_PATH = `${FileSystem.documentDirectory}${name}workorderQueue.json`;

  try {
    const fileInfo = await FileSystem.getInfoAsync(QUEUE_FILE_PATH);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(QUEUE_FILE_PATH, { idempotent: true });
      console.log("🗑️ File deleted:", filename);
    } else {
      console.log("⚠️ File not found:", filename);
    }
  } catch (error) {
    console.log("❌ Error deleting file:", error);
  }
};
