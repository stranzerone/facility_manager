import NetInfo from "@react-native-community/netinfo";
import complaints from "./mockComplaintData.json";
import { addToQueue } from "../../offline/fileSystem/fileOperations";
import ch_maps from "./ch_maps.json";
import ch_workorders from "./ch_workorders.json";
import ch_instructions from "./ch_instructions.json";

// Utility: map workorder UUIDs to { as: {}, st: {}, wo }
const mapWorkorders = (ids = []) => {
  return ids
    .map(id => {
      const wo = ch_workorders[id];
      return wo ? { as: {}, st: {}, wo } : null;
    })
    .filter(Boolean);
};

// Utility: map all workorders
const mapAllWorkorders = () => {
  return Object.values(ch_workorders).map(wo => ({
    as: {},
    st: {},
    wo,
  }));
};

export const Interceptor = {
  request: async (url, method, data, headers, params) => {
    const netState = await NetInfo.fetch();
    const isOffline = !netState.isConnected;

    if (!isOffline) {
      return { url, method, data, headers };
    }
    console.log("inside offline call")

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
          return { ...responseTemplate, data: mapAllWorkorders() };

        case url.includes('/v3/workorder/assigned/asset?'):
          const assetIDs = ch_maps.asset_wo_map[params?.asset_uuid] || [];
          return { ...responseTemplate, data: mapWorkorders(assetIDs) };

        case url.includes('/v3/workorder/assigned/location?'):
          const locationIDs = ch_maps.location_wo_map[params?.location_uuid] || [];
          return { ...responseTemplate, data: mapWorkorders(locationIDs) };

        case url.includes('/v3/insts'):
          return {
            ...responseTemplate,
            data: ch_instructions[params?.ref_uuid]?.instructions || [],
          };

        case url.includes('/staff/mycomplaints'):
          return { ...responseTemplate, data: complaints };

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

    else if(method !== "GET") {
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
