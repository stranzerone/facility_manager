import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiCommon } from "../ApiCommon";
import { Util } from "../Util";
import { API_URL } from "@env";
import { Common } from "../Common";

export const workOrderService = {

  getAllWorkOrders: async (params) => {
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/workorder/filter`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
  },






  createWorkOrder: async (workOrderData) => {
    const societyInfo = await AsyncStorage.getItem('societyInfo');
    const site_uuid =  JSON.parse(societyInfo);
    const storedStatusesString = await AsyncStorage.getItem('statusUuid');
    const storedStatuses = storedStatusesString ? JSON.parse(storedStatusesString) : [];

    let user = await Common.getLoggedInUser()
    console.log(user, "user in workorder service")
    const getStatusUuid = (statusName) => {

      const status = storedStatuses?.find(item => item.Name === statusName);
      return status ? status.uuid : ""; // Return found UUID or empty string if not found
    };
    const data ={
      "Name": workOrderData.name,
      "Type": workOrderData.type,
      "Asset": workOrderData.asset?.Name || "", // If undefined, set it to an empty string
      "Due Date": workOrderData.dueDate,
      "Estimated Time": workOrderData.estimatedTime,
      "Priority": workOrderData.priority,
      "user_id": user.data.id,
      "asset_uuid": workOrderData.asset?.uuid || '',
      "breakdown": workOrderData.woType === "breakdown", 
      "Status": "OPEN",
      "status_uuid": getStatusUuid("OPEN"),
      "site_uuid":site_uuid,
      "created_by":user.data.id
    }
    console.log(data, "inside invoice service");
    const url = `${API_URL}/v3/${workOrderData.woType}`;
    console.log(url, data, "this is on addworkorder service");
    const headers = await Util.getCommonAuth()

    return await ApiCommon.postReq(url, data, headers);
  },










  appendParamsInUrl: (url, params) => {
    
    if (params && typeof params === "object") {
      const queryParams = Object.keys(params)
        .filter((key) => params[key] !== null && params[key] !== undefined)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

      if (queryParams) {
        url += url.includes('?') ? '&' : '?';
        url += queryParams;
      }
    }

    return url;
  }
};
