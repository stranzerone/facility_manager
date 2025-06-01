import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiCommon } from "../ApiCommon";
import { Util } from "../Util";
import { API_URL, API_URL3, API_URL2 } from "@env";
import { Common } from "../Common";
import { OneSignal } from 'react-native-onesignal';

export const workOrderService = {



  getSiteInfo: async () => {
    const user = await Common.getLoggedInUser()
    const params = {

      "user-id": user?.data.id,
      'api-token': user?.data?.api_token,
    };
    const url = workOrderService.appendParamsInUrl(`${API_URL2}/linkedsites`, params);
    const headers = await Util.getCommonAuth()
    const response = await ApiCommon.getReq(url, headers);
    console.log(response,"this is response for site info" )
    if (response.data) {    
     const data = response.data[user.data.societyId].ppm_site.uuid    ;
    await AsyncStorage.setItem('societyInfo', JSON.stringify(data));
    return data

    
    } else {
      return false
    }


  },


  getStatuesUuid: async () => {
    const user = await Common.getLoggedInUser()

    const params = {
      "site_id": user.data.societyId,
      "user-id": user.data.id,
      "api-token": user.data.api_token,
    };

    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/status?`, params);
    const headers = await Util.getCommonAuth()
    return   await ApiCommon.getReq(url, headers);



  },


  getAllTeams: async (siteUuId) => {
    const user = await Common.getLoggedInUser()
    const params = {
      site_uuid: siteUuId,
      "user-id": user.data.id,
      "api-token": user.data.api_token,
    };
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/teams?`, params);
    console.log(url,'this team url')
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
  },



  getAllUsers: async () => {
    console.log("getting all users")
    const user = await Common.getLoggedInUser()
    const params = {
      "user-id": user.data.id,
      "api-token": user.data.api_token,
    };

    const url = workOrderService.appendParamsInUrl(`${API_URL2}/nonresidents`, params);
    const headers = await Util.getCommonAuth()
    console.log(url,'this is url for callign users')
    const response =  await ApiCommon.getReq(url, headers);
    console.log(response, "this is resposne for all suers")
    return response
  },


  getCategories: async () => {
    const societyInfo = await AsyncStorage.getItem('societyInfo');
    const site_uuid = JSON.parse(societyInfo);
    const user = await Common.getLoggedInUser()
    const params = {
      site_uuid: site_uuid,
      "api-token": user.data.api_token,
      "user-id": user.data.id,
      "api-token": user.data.api_token,
      "user-id": user.data.id,
    };
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/category/ppm?`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
  },




  appUnrigester: async () => {
    const deviceId = await OneSignal.User.pushSubscription.getIdAsync();

    const payload = {
      "userId": deviceId,
      "tenant": 0
    }
    const url = `${API_URL2}/appUnRegistered`;
    const headers = await Util.getCommonAuth()
    return await ApiCommon.postReq(url, payload, headers);
  },




 getFutureWo: async (fromDate, toDate) => {
    const user = await Common.getLoggedInUser()

    const params = {
      society_id:user.data.societyId,
        from:fromDate,
        to: toDate,
        self_assigned:"true",
        future_wo:"true"
    };

    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/callender/workorders`, params);
    const headers = await Util.getCommonAuth()
  return  await ApiCommon.getReq(url, headers);

    

  },


  getAllWorkOrders: async (selectedFilter, flag) => {
    const user = await Common.getLoggedInUser()

    const params = {
      site_id: user.data.societyId,
      breakdown1: false,
      breakdown2: false,
      breakdown: false,
      page_no: 1,
      Status: selectedFilter,
      user_id: user.data.id,
      'api-token': user.data.api_token,
    };
    if (flag) {
      params.flag_delay = flag;
    }
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/workorder/filter`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers,params);
  },



    getStatusUuids: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "site_id": user.data.societyId,
      "user-id": user.data.id,
      "api-token": user.data.api_token,
    };
 
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/status`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers,params);
  },



  getAllPms: async ({asset_uuid }) => {
    const user = await Common.getLoggedInUser()

    const params = {
      site_id: user.data.societyId,
      api_token: user.data.api_token,
      "user-id": user.data.id,
      'site-id': user.data.societyId,
      'api-token': user.data.api_token,
    };

    if (asset_uuid) {
      params.asset_uuid = asset_uuid
    }
    console.log(params,'this are params')
    let url;

    if(asset_uuid){
     url = workOrderService.appendParamsInUrl(`${API_URL}/v3/asset/pm`, params);
    }else{
           url = workOrderService.appendParamsInUrl(`${API_URL}/v3/pm/all`, params);

    }
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
  },



  createWorkOrderFromPpm: async ({ uuid }) => {


    const url = `${API_URL}/v3/action/createwofrompm`;
    const headers = await Util.getCommonAuth()
    const payload = uuid

    return await ApiCommon.postReq(url, payload, headers);
  },




  createWorkOrder: async (workOrderData) => {
    const societyInfo = await AsyncStorage.getItem('societyInfo');
    const site_uuid = JSON.parse(societyInfo);
    const storedStatusesString = await AsyncStorage.getItem('statusUuid');
    console.log(storedStatuses,'this are storedStatuses')
    const storedStatuses = storedStatusesString ? JSON.parse(storedStatusesString) : [];

    let user = await Common.getLoggedInUser()
    const getStatusUuid = (statusName) => {

      const status = storedStatuses?.find(item => item.Name === statusName);
      return status ? status.uuid : ""; // Return found UUID or empty string if not found
    };
    const data = {
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
      "site_uuid": site_uuid,
      "created_by": user.data.id
    }
    const url = `${API_URL}/v3/${workOrderData.woType}`;
    const headers = await Util.getCommonAuth()

    console.log(data,'thi sis pay')
    return await ApiCommon.postReq(url, data, headers);
  },





  getInstructionsForWo: async (params) => {
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/insts`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers, params);
  },

  getAssetWorkOrder: async (qrValue, selectedFilter, breakdown) => {
    let user = await Common.getLoggedInUser()
    const params = {
      asset_uuid: qrValue,
      per_page: '10',
      page_no: '1',
      "user_id": user.data.id,
      site_id: user.data.societyId,
      Status: selectedFilter,
      breakdown: breakdown,
      "api-token": user.data.api_token,
      "user-id": user.data.id,
      "api-token": user.data.api_token,
      "user-id": user.data.id
    };
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/workorder/assigned/asset?`, params);
    const headers = await Util.getCommonAuth()
    const response = await ApiCommon.getReq(url, headers, params);
    console.log(response,'this is resposne on api')
    return response
  },



  getLocationWorkOrder: async (uuid, status, breakdownActive) => {
    let user = await Common.getLoggedInUser()
    const params = {
      location_uuid: uuid,
      per_page: '10',
      page_no: '1',
      user_id: user.data.id,
      site_id: user.data.societyId,
      Status: status,
      breakdown: breakdownActive,
      "api-token": user.data.api_token,
      "user-id": user.data.id,
      "api-token": user.data.api_token,
      "user-id": user.data.id
    };
    console.log(params,'this are for loatin api')
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/workorder/assigned/location?`, params);
    const headers = await Util.getCommonAuth()
    const response = await ApiCommon.getReq(url, headers, params);
    console.log(response,'this is for location wo response')
    return response
  },






  getWorkOrderComments: async (WoUuId, selectedButton) => {
    let user = await Common.getLoggedInUser()
    const params = {
      ref_uuid: WoUuId,
      type: "WO",
      order: "desc",
      page_no: 1,
      per_page: 100,
      "api-token": user.data.api_token,
      "user-id": user.data.id,
      "api-token": user.data.api_token,
      "user-id": user.data.id

    };

    if (selectedButton !== "all") {
      params.tag = selectedButton
    }
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/comments?`, params);
    const headers = await Util.getCommonAuth()
    const response = await ApiCommon.getReq(url, headers, params);
    return response
  },












  getInstructionsComments: async (params) => {
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/comments?`, params);
    const headers = await Util.getCommonAuth()
    const response =  await ApiCommon.getReq(url, headers);
    console.log("these are response")
    return response
  },






  getWorkOrders: async (selectedFilter, flag, page) => {


    let user = await Common.getLoggedInUser()

    const params = {
      site_id: societyId,
      breakdown1: false,
      breakdown2: false,
      breakdown: false,
      page_no: page,
      Status: selectedFilter,
      user_id: user.data.id,

      'api-token': apiToken,
    };

    if (flag) {
      params.flag_delay = flag;
    }

    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/workorder/filter`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
  },


  markAsCompleteWo: async ({ item, remark, sequence, siteUuid }) => {
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/workorder`);
    const headers = await Util.getCommonAuth()
    let user = await Common.getLoggedInUser()
    const societyInfo = await AsyncStorage.getItem('societyInfo');
    const parsedSocietyInfo = JSON.parse(societyInfo)
    const storedStatusesString = await AsyncStorage.getItem('statusUuid');
    const storedStatuses = storedStatusesString ? JSON.parse(storedStatusesString) : [];

    const getStatusUuid = (statusName) => {

      const status = storedStatuses?.find(item => item.Name === statusName);
      return status ? status.uuid : ""; // Return found UUID or empty string if not found
    };
    const payload = {
      Status: "COMPLETED",
      closed_by: user.data.id,
      completed_at: new Date().toISOString().replace("T", " ").split(".")[0],
      site_uuid: parsedSocietyInfo,
      status_uuid: getStatusUuid("COMPLETED"),
      updated_at: new Date().toISOString().replace("T", " ").split(".")[0],
      updated_by: user.data.id,
      instruction_remark: remark,
      uuid: item.uuid,
    };

    return await ApiCommon.putReq(url, payload, headers);
  },



    updateDelayResone: async ( uuid, delayReason) => {
      console.log("updating delay reasone")
    const societyInfo = await AsyncStorage.getItem('societyInfo');
    let user = await Common.getLoggedInUser()
    const site_uuid = JSON.parse(societyInfo)

    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/workorder`);
    const headers = await Util.getCommonAuth()

    const payload = {
      flag_delay_reason: delayReason,
      site_uuid: site_uuid,
      updated_by: user.data.id,
      uuid: uuid
    };

    return await ApiCommon.putReq(url, payload, headers);
  },







  getWoInfo: async (WoUuId) => {
    let user = await Common.getLoggedInUser()

    const params = {
      uuid: WoUuId,
      site_id: user.data.societyId,
      "api-token": user.data.api_token,
      "user-id": user.data.id,
      "api-token": user.data.api_token,
      "user-id": user.data.id
    };


    const url = workOrderService.appendParamsInUrl(`${API_URL}/v4/workorder`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers, params);
  },


  getAsets: async (text) => {
    let user = await Common.getLoggedInUser()
    const params = {
      site_id: user.data.societyId, // Using site_id directly
      str: text, // Empty string to fetch all assets
    };

    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/asset/search?`, params);
    const headers = await Util.getCommonAuth()
    const response = await ApiCommon.getReq(url, headers);
    return response
  },


  addComments: async (payload) => {


    const url = `${API_URL}/v3/comment`;
    const headers = await Util.getCommonAuth()

    return await ApiCommon.postReq(url, payload, headers);
  },


  getQrAssets: async () => {
    const user = await Common.getLoggedInUser()
    const params = {
      "api-token": user.data.apiToken,
      "user-id": user.data.id,
      "site_id": user.data.societyId
    };

    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/asset/all/display?`, params);
    const headers = await Util.getCommonAuth()

    return await ApiCommon.getReq(url, headers, params);
  },







  updateInstruction: async (payload) => {
    console.log(payload, 'this is paylod for api call')
    const url = `${API_URL}/v3/inst`;
    const headers = await Util.getCommonAuth()
    const response = await ApiCommon.putReq(url, payload, headers);
    return response
  },

createPms: async (payload) => {
    console.log(payload, 'this is paylod for api call')
    const url = `${API_URL}/v3/action/createwofrompm`;
    const headers = await Util.getCommonAuth()
    const response = await ApiCommon.postReq(url, payload, headers);
    console.log('this is url for create psm',response)
    return response
  },


  addPdfToServer: async (data) => {

    let user = await Common.getLoggedInUser()
    const formData = new FormData();
    formData.append('name', data.fileName); // File name
    formData.append('type', data.mimeType); // MIME type (e.g., image/jpeg)
    formData.append('file', {
      uri: data.uri,
      name: data.fileName || data.name, // File name or fallback
      type: data.mimeType, // MIME type (e.g., image/jpeg)
    });


    // Append user-id and api-token to the form data
    formData.append('user-id', user.data.id);
    formData.append('api-token', user.data.api_token);
    const url = `${API_URL3}/v1/society/${user.data.societyId}/publicupload`;
    const headers = {
      'Content-Type': 'multipart/form-data', // Correct header for file upload
    }
    const response = await ApiCommon.postReq(url, formData, headers);
    // if(response.url){
    //   const payload = {
    //     id:date.uuid,
    //     result: response.url, 
    //     remark:""
    //   }

    //   const response = await workOrderService.updateInstruction(payload)
    //   console.log(response.data,'this is response for update instruction after getting url')
    // }
    return response
  },





  getInstructionsDetails: async (params) => {
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v4/workorder?`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
  },


  getOfflineCache: async () => {
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v4/my/app/cache`);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
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
