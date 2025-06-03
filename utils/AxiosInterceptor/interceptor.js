import NetInfo from "@react-native-community/netinfo";
import complaints from "./mockComplaintData.json";
import { addToQueue, readFromFile } from "../../offline/fileSystem/fileOperations";
import Toast from "react-native-toast-message";
// Utility: map workorder UUIDs to { as: {}, st: {}, wo }


// Utility: map all workorders


export const Interceptor = {
  request: async (url, method, data, headers, params) => {
    const netState = await NetInfo.fetch();
    const isOffline = !netState.isConnected;
    const ch_maps = await readFromFile('ch_maps');
    const ch_workorders = await readFromFile('ch_workorders');
    const ch_instructions = await readFromFile('ch_instructions');


const mapAllWorkorders = () => {
  const now = new Date();
  return Object.values(ch_workorders)
    .filter(wo => {
      const dueDate = new Date(wo["Due Date"]);
      return dueDate <= now; // only include workorders with due date <= now
    })
    .map(wo => ({
      as: {},
      st: {},
      wo: wo,
    }));
};

const excludedOfflineRoutes = [
  '/v3/workorder', // example
  '/v3/breakdown',
];

const mapWorkorders = (ids = [], breakdown = false) => {
  return ids
    .map(id => {
      const wo = ch_workorders[id];
      // Only return if 'wo' exists and matches the breakdown value
      return wo && wo.breakdown == breakdown ? { as: {}, st: {}, wo } : null;
    })
    .filter(Boolean);
};

    if (!isOffline) {
      console.log(url,headers,'this is url')
      return { url, method, data, headers };
    }
    // Handle GET
    if (method === "GET") {
      const responseTemplate = {
        status: 'success',
        fromCache: true,
        message: 'matching data found from offline cache',
        data: [],
      };

      console.log(url,params,'this is url used')
      switch (true) {


        case url.includes('/v3/workorder/filter'):
          return { ...responseTemplate, data: mapAllWorkorders().slice(0,20) };

    case url.includes('/v3/workorder/assigned/asset?'):
console.log('inside assets',ch_maps)
  const assetBreakdown =  params?.breakdown 

  const assetIDKey = params?.asset_uuid?.toString(); // Ensure key is string
  console.log(assetIDKey,'this are assetIds')
  const assetIDs = ch_maps[assetIDKey] || [];

  console.log(assetIDs, 'these are asset IDs');

  return { ...responseTemplate, data: mapWorkorders(assetIDs,assetBreakdown).slice(0,2) };

        case url.includes('/v3/workorder/assigned/location'):
          console.log('inside location')
            const locationIDKey = params?.location_uuid?.toString(); // Ensure key is string
             const locationBreakdown =  params?.breakdown 
          const locationIDs = ch_maps[locationIDKey,locationBreakdown];
          return { ...responseTemplate, data: mapWorkorders(locationIDs).slice(0,2) };

        case url.includes('/v3/insts'):
          console.log(params.ref_uuid,'this are params')
          return {
            ...responseTemplate,
            data: ch_instructions[params.ref_uuid] || [],
          };

        case url.includes('/staff/mycomplaints'):
          const data = await readFromFile('complaints')
          return { ...responseTemplate, data: data || [] };

        default:
          break;
      }

      return {
        status: 'success',
        fromCache: true,
        data: [],
        message: 'No matching offline cache or data not found',
      };
    }

 else if (method !== "GET") {
const isExcluded = excludedOfflineRoutes.some(route => url.includes(route));

if (isExcluded) {
  console.log('i am excluded')
  Toast.show({
    type: 'error',
    text1: 'OOPS! You are Offline',
    text2: 'Please connect to the internet to perform this action.',
    position: 'top',
  });

  return {
    status: 'error',
    fromCache: true,
    message: 'Offline action not allowed for this route',
  };
}


      try {
        await addToQueue("queueData", {
          url,
          method,
          payload: data,
        });

        return {
          status: 'success',
          fromCache: true,
          message: 'Request queued successfully (offline mode)',
        };
      } catch (err) {
        return {
          status: 'error',
          fromCache: true,
          message: 'Failed to queue request',
          error: err.message,
        };
      }
    }

    // Default fallback
    return {
      status: 'success',
      fromCache: true,
      data: [],
      message: 'Offline request type not handled',
    };
  }
};
