import * as FileSystem from 'expo-file-system';
export const writeToFile = async (fileName, data) => {
  try {
    const fileUri = FileSystem.documentDirectory + fileName;
    const stringifiedData = JSON.stringify(data); // ✅ Convert object to string

    await FileSystem.writeAsStringAsync(fileUri, stringifiedData, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    console.log(`✅ Data written to ${fileUri}`);
  } catch (error) {
    console.error('❌ Error writing to file:', error);
  }
};


export const readFromFile = async (fileName) => {
  try {
    const fileUri = FileSystem.documentDirectory + fileName;
    const content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
  }
};

// fileSystem/fileOperations.js


export const addToQueue = async (data, name) => {
  const QUEUE_FILE_PATH = `${FileSystem.documentDirectory}${name}Queue.json`;

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

export const getQueue = async (name) => {
  const QUEUE_FILE_PATH = `${FileSystem.documentDirectory}${name}Queue.json`;

  try {
    const content = await FileSystem.readAsStringAsync(QUEUE_FILE_PATH);
    return JSON.parse(content);
  } catch {
    return [];
  }
};

export const clearQueue = async (name) => {
  const QUEUE_FILE_PATH = `${FileSystem.documentDirectory}${name}workorderQueue.json`;

  try {
    await FileSystem.writeAsStringAsync(QUEUE_FILE_PATH, JSON.stringify([]));
  } catch (error) {
    console.log("❌ Error clearing queue", error);
  }
};
