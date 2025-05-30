import { Util } from "../../services/Util";
import { clearQueue, getQueue, removeFromQueue } from "./fileOperations";
import Toast from 'react-native-toast-message';
import { usePermissions } from "../../app/GlobalVariables/PermissionsContext"; // Optional if using context

export const syncOfflineQueue = async (queueLength,setQueueLength) => {
  let queue = await getQueue("queueData"); // [{ url, method, payload }]
  console.log("🔄 Sync started. Queue:", queue);

  if (!queue || !queue.length) {
    console.log("📭 No items to sync");
    return;
  }

  const headers = await Util.getCommonAuth();

  const updatedQueue = []; // Store failed items here

  for (const item of queue) {
    try {
      console.log(item)
      const response = await fetch(item.url, {
        method: item.method,
        headers,
        body: JSON.stringify(item.payload),
      });

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: '✅ Sync Successful',
          text2: `Synced: ${item.url}`,
          position: 'top',
          visibilityTime: 3000,
        });
        setQueueLength(queueLength --)
        console.log("✅ Synced:", item.url);
        removeFromQueue("queueData", item); // Remove from queue after successful sync
      } else {
        console.warn(`⚠️ Sync failed for ${item.url} with status ${response.status}`);
        updatedQueue.push(item); // Add back failed request
        Toast.show({
          type: 'error',
          text1: '❌ Sync Failed',
          text2: `Status ${response.status}: ${item.url}`,
          position: 'top',
          visibilityTime: 4000,
        });
      }
    } catch (err) {
      console.warn("❌ Sync error:", item.url, err.message);
      updatedQueue.push(item); // Add back failed request
      Toast.show({
        type: 'error',
        text1: '❌ Sync Error',
        text2: `Error: ${item.url}`,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  }

  // Save updated queue (with only failed requests)
  if (updatedQueue.length > 0) {
    // await saveQueue("queueDataSaved", updatedQueue);
    console.log("⚠️ Some items failed. Queue updated.");
  } else {
    // await clearQueue("queueData");
    console.log("✅ All items synced. Queue cleared.");
  }


};
