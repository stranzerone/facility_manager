import NetInfo from "@react-native-community/netinfo";
import mockData from './mockData.json'; // Local offline fallback data
import comlaints from "./mockComplaintData.json"
import { addToQueue } from "../../offline/fileSystem/fileOperations";

export const Interceptor = {
  request: async (url, method, data, headers, params) => {


    const netState = await NetInfo.fetch();
    const isOffline = !netState.isConnected;

    console.log(isOffline,'this is offline')
    if (!isOffline) {
      return { url, method, data, headers };
    }
    



    let cachedResponse = null;

    if (method === "GET") {
      console.log("GET",url,params)
      // Switch block for offline URL matches
      switch (true) {
        case url.includes('/v3/workorder/filter'):
          cachedResponse = handleAssignedWorkordersByAsset(params);
          break;

               case url.includes('/v3/workorder/assigned/asset?'):
          cachedResponse = handleAssignedWorkordersByAsset(params);
          break;

        case url.includes('/v3/workorder/assigned/location?'):
          cachedResponse = handleAssignedWorkordersByAsset(params);
          break;

        case url.includes('/v3/insts'):
          cachedResponse = handleAssignedWorkordersByAsset(params);
          break;

        case url.includes('/staff/mycomplaints'):
          cachedResponse = handleComplaints(params);
          break;
        // Add more offline endpoints here as needed
        default:
          break;
      }
    }

    if (method === "PUT") {
      // Switch block for offline URL matches
      switch (true) {
        case url.includes('/staff/updatecomplaint'):
          await addToQueue("closeComplaint", data)
          break;


        case url.includes('/v3/workorder'):
          await addToQueue("markCompleteWo", data)
          break;

         case url.includes('/staff/updatecomplaint'):
          await addToQueue("closeComplaint", data)
          break;
        // Add more offline endpoints here as needed
        default:
          break;
      }
    }






    if (method === "POST") {

      // Switch block for offline URL matches
      switch (true) {
        case url.includes('/v3/insts'):
          await addToQueue(data, "updateInstruction");
          break;

        // Add more offline POST endpoints here as needed
        case url.includes('/publicupload'):
          await addToQueue(data, "pdfFile");
          break;

        case url.includes('/v3/comments'):
          await addToQueue(data, "woComments");
          break;

             case url.includes('/addComplaint'):
          await addToQueue(data, "complaint");
          break;

                 case url.includes('/staff/addcomment'):
          await addToQueue(data, "complaint");
          break;

        default:
          break;
      }

      // Return standard offline POST response
      return {
        status: 'success',
        fromCache: true,
        data: [],
        message: 'Added to queue',
      };
    }








    // Return offline cached data if found
    if (cachedResponse) {
      return {
        ...cachedResponse,
        fromCache: true,
        status: 'success',
      };
    }

    // Default empty response for unmatched offline requests
    return {
      status: 'success',
      fromCache: true,
      data: [],
      message: 'No matching offline cache or data not found',
    };
  }
};


const handleAssignedWorkordersByAsset = (params) => {
  console.log(params, 'this are params')
  const assetUUID = params?.asset_uuid;
  const ref_uuid = params?.ref_uuid
  const loc_uuid = params?.location_uuid
 const selectedFilter = params?.Status
 console.log(params,'this is params')
  console.log(assetUUID, ref_uuid, loc_uuid, 'this are botg id')
  if (loc_uuid && selectedFilter) {

    const location = mockData.data.find(loc => loc.uuid === loc_uuid);

    if (!location) return []; // Location not found

    let allWorkOrders = [];

    for (const asset of location.assets || []) {
      if (asset.workorders && Array.isArray(asset.workorders)) {
        allWorkOrders = allWorkOrders.concat(asset.workorders);
      }
    }

    return { data: allWorkOrders || [] };

  }
else if (selectedFilter) {
  let allWorkorders = [];

  for (const location of mockData.data) {
    for (const asset of location.assets) {
      if (Array.isArray(asset.workorders)) {
        const filteredWorkorders = asset.workorders.filter(
          (wo) => wo.wo?.Status === selectedFilter
        );
        allWorkorders.push(...filteredWorkorders);
      }
    }
  }

  return { data: allWorkorders };
}

  for (const location of mockData.data) {
    const asset = location.assets.find((a) => a.uuid === assetUUID);
    if (asset && !ref_uuid) {
      return { data: asset.workorders || [] };
    }
    if (asset && ref_uuid) {
      console.log(wo, 'this is wor for instructions retyrn')
      const wo = asset?.workorders.find((a) => a.wo.uuid === ref_uuid);
      if (wo)
        return { data: wo.wo.instructions || [] };
    }
  }

  return { data: [], message: 'Asset not found in offline cache' };
};




const handleComplaints = () => {
  return { data: comlaints || [] };



};
