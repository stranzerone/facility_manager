import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiCommon } from "../ApiCommon";
import { Util } from "../Util";
import { API_URL,API_URL3 } from "@env";
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





  getInstructionsForWo: async (params) => {
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/insts`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
  },

  getAssetWorkOrder:async (qrValue,selectedFilter,breakdown) => {
    console.log("getting data from common")
     let user = await Common.getLoggedInUser()
     const params = {
      asset_uuid:qrValue,
      per_page:'10',
      page_no:'1',
      "user_id": user.data.id,
      site_id:user.data.societyId,
      Status:selectedFilter,
      breakdown:breakdown,
      "api-token": user.data.api_token,
      "user-id": user.data.id,
      "api-token": user.data.api_token,
      "user-id": user.data.id
    };
    console.log(params,'this are for api call')
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/workorder/assigned/asset?`, params);
    const headers = await Util.getCommonAuth()
    const response =  await ApiCommon.getReq(url, headers,params);
    console.log(response,'this is for workorders assets')
    return response
  },




  getInstructionsComments: async (params) => {
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/comments?`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
  },


   getAsets : async (text) => {
    let user = await Common.getLoggedInUser()
    
  

    const params = {
      site_id: user.data.societyId, // Using site_id directly
      str: text, // Empty string to fetch all assets
    };

    console.log(params,'this are the params at start')
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v3/asset/search?`, params);
    const headers = await Util.getCommonAuth()
    const response =  await ApiCommon.getReq(url, headers);
    console.log(response.data)
    return response
  },


  addComments: async (payload) => {



    const url = `${API_URL}/v3/comment`;
    const headers = await Util.getCommonAuth()

    return await ApiCommon.postReq(url, payload, headers);
  },




  updateInstruction : async (payload) => {



    const url = `${API_URL}/v3/inst`;
    const headers = await Util.getCommonAuth()

     console.log(payload,'this is paylod for update inst offline')
     const response = await ApiCommon.putReq(url, payload, headers);
     console.log(response,'this is resposne for updating inst')
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
   const  headers= {
      'Content-Type': 'multipart/form-data', // Correct header for file upload
    }
    console.log(formData, "this is form data for pdf upload")
  const response =  await ApiCommon.postReq(url,formData, headers);
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





  getInstructionsDetails : async(params) => {
    const url = workOrderService.appendParamsInUrl(`${API_URL}/v4/workorder?`, params);
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
