import NetInfo from "@react-native-community/netinfo";
import { addToQueue, readFromFile } from "../../offline/fileSystem/fileOperations";
import Toast from "react-native-toast-message";
import {APP_ID}  from "@env"
import AsyncStorage from "@react-native-async-storage/async-storage";
// Utility: map workorder UUIDs to { as: {}, st: {}, wo }


// Utility: map all workorders


export const Interceptor = {
  request: async (url, method, data, headers, params,formdata) => {
    const netState = await NetInfo.fetch();
    const isOffline = !netState.isConnected;
    const ch_maps = await readFromFile('ch_maps');
    const ch_workorders = await readFromFile('ch_workorders');
    const ch_instructions = await readFromFile('ch_instructions');


const mapAllWorkorders = (Status = "OPEN") => {
  const now = new Date();

  return Object.values(ch_workorders)
    .filter(wo => {
      const dueDate = new Date(wo["Due Date"]);
      return (
        dueDate <= now &&
        wo.Status == Status 
      );
    })
    .map(wo => ({
      as: {},
      st: {},
      wo: wo,
    }));
};

const excludedOfflineRoutes = [
  { route: '/v3/workorder', method: 'POST' },
  {route :'/v3/breakdown',method:"POST"},
  {route :'/v3/action/createwofrompm',method:"POST"},
  {route :'/addComplaint',method:"POST"}
 ];

const mapWorkorders = (ids = [], breakdown = false,Status= "OPEN") => {
  return ids
    .map(id => {
      const wo = ch_workorders[id];
      // Only return if 'wo' exists and matches the breakdown value
      return wo && wo.breakdown == breakdown && wo.Status == "OPEN" ? { as: {}, st: {}, wo } : null;
    })
    .filter(Boolean);
};
if (!isOffline) {
  console.log("i am online")
  const userInfo = await AsyncStorage.getItem('userInfo');
  const loggedInUser = JSON.parse(userInfo);
  const roleId = loggedInUser?.data?.role_id ?? null;

  let modUrl = url;
  
  // Check if url already has query parameters
  if (modUrl.includes('?')) {
    modUrl += `&group-id=${roleId}&app_id=${APP_ID}`;
  } else {
    modUrl += `?group-id=${roleId}&app_id=${APP_ID}`;
  }

  return { url: modUrl, method, data, headers };
}

    // Handle GET
    if (method === "GET") {
      const responseTemplate = {
        status: 'success',
        fromCache: true,
        message: 'matching data found from offline cache',
        data: [],
      };

      switch (true) {


        case url.includes('/v3/workorder/filter'):
          const selectedFilter = params?.Status?.toString();
          const skip = params?.skip?.toString()
          return { ...responseTemplate, data: mapAllWorkorders(selectedFilter).slice(0+skip,20+skip) };

    case url.includes('/v3/workorder/assigned/asset?'):
  const assetBreakdown =  params?.breakdown 
  const assetIDKey = params?.asset_uuid?.toString(); // Ensure key is string
  const assetIDs = ch_maps[assetIDKey] || [];


  return { ...responseTemplate, data: mapWorkorders(assetIDs,assetBreakdown).slice(0,2) };

        case url.includes('/v3/workorder/assigned/location'):
            const locationIDKey = params?.location_uuid?.toString(); // Ensure key is string
             const locationBreakdown =  params?.breakdown 
          const locationIDs = ch_maps[locationIDKey,locationBreakdown];
          return { ...responseTemplate, data: mapWorkorders(locationIDs).slice(0,2) };

        case url.includes('/v3/insts'):
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
const isExcluded = excludedOfflineRoutes.some(item => 
  url.includes(item.route) && method === item.method
);
if (isExcluded) {
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
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // unique id
          url,
          method,
          payload: data,
          formdata
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









//  const isExcluded = excludedRoutes.some(route => url?.includes(route));
//       if (!isExcluded && roleId && !url.includes('group-id=')) {
//         const separator = url.includes('?') ? '&' : '?';
//         url = `${url}${separator}group-id=${roleId}`;
//       }

//       const isFormData = options.body instanceof FormData;
//       if(isFormData){
//         console.log("is formData")

//       }


//       // Let browser set Content-Type for FormData
//       const headers = {
//         ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
//         ...options.headers,
//       };

//       const config = {
//         ...options,
//         headers,
//       };

//       return originalFetch(url, config);