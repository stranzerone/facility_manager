import { Util } from "../../services/Util";
import { clearQueue, getQueue, removeFromQueue, writeToFile } from "./fileOperations";
import Toast from 'react-native-toast-message';
import { complaintService } from "../../services/apis/complaintApis";
import { workOrderService } from "../../services/apis/workorderApis";

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
      const response = await fetch(item.url, {
        method: item.method,
        headers,
        body: JSON.stringify(item.payload),
      });

      if (response.ok) {

    if(item.formdata && item.payload){
      
   const newResponse = await workOrderService.addPdfToServerInstruction(item.formdata,item.payload,true)
    }


        // Toast.show({
        //   type: 'success',
        //   text1: '✅ Sync Successful',
        //   position: 'top',
        //   visibilityTime: 3000,
        // });
        setQueueLength(queueLength --)
        removeFromQueue("queueData", item.id); // Remove from queue after successful sync
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


};



export const getOfflineData = async (setFetchingOffline) => {
  setFetchingOffline(true);
  try {
    Toast.show({
      type: 'info',
      text1: '⬇️ Syncing Data',
      text2: 'Fetching offline data from server...',
      position: 'top',
      visibilityTime: 2500,
    });

    const cacheResponse = await workOrderService.getOfflineCache();
   const complaint_response = await complaintService.getAllComplaints()
    // Safely normalize workorders and directWos
    const sanitizeWorkorders = (source) => {
      const result = {};
      if (Array.isArray(source)) {
        source.forEach((wo) => {
          if (wo?.uuid) result[wo.uuid] = wo;
        });
      } else if (typeof source === 'object' && source !== null) {
        Object.values(source).forEach((wo) => {
          if (wo?.uuid) result[wo.uuid] = wo;
        });
      }
      return result;
    };

    const workorders = sanitizeWorkorders(cacheResponse?.data?.workorders);
    const directWos = sanitizeWorkorders(cacheResponse?.data?.direct_wos);


    const locationMap =
      typeof cacheResponse?.data?.location_wo_map === 'object'
        ? cacheResponse.data.location_wo_map
        : {};

    const assetMap =
      typeof cacheResponse?.data?.asset_wo_map === 'object'
        ? cacheResponse.data.asset_wo_map
        : {};

    // ✅ Merge sanitized workorders
    const combinedWorkorders = {
      ...workorders,
      ...directWos,
    };

    const combinedMaps = {
      ...locationMap,
      ...assetMap,
    };

    // ✅ Write to file
    await writeToFile('ch_workorders', combinedWorkorders);
    await writeToFile('ch_instructions', cacheResponse.data.instructions || {});
    await writeToFile('ch_maps', combinedMaps);
    await writeToFile('ch_complaints',complaint_response);


    Toast.show({
      type: 'success',
      text1: '✅ Offline Sync Complete',
      text2: 'Work orders and instructions saved.',
      position: 'top',
      visibilityTime: 3000,
    });
  } catch (error) {
    console.error('❌ Error fetching offline data:', error);
    Toast.show({
      type: 'error',
      text1: '❌ Offline Sync Failed',
      text2: 'Please check your network connection.',
      position: 'top',
      visibilityTime: 4000,
    });
  } finally {
    setFetchingOffline(false);
  }
};
