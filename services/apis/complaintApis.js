import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiCommon } from "../ApiCommon";
import { Common } from "../Common";
import { Util } from "../Util";
import { API_URL2 } from "@env";

export const complaintService = {
  getAllComplaints: async () => {
    const user = await Common.getLoggedInUser()
  const params = {
      all: 1,
      page_no: 1,
      per_page: 100,
    "user-id":user.data.id,
    "api-token":user.data.api_token
    };
    const url = complaintService.appendParamsInUrl(`${API_URL2}/staff/mycomplaints`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
  },


  getComplaintCategories: async () => {
     const user = await Common.getLoggedInUser()
    const params = {
    "user-id":user.data.id,
    "api-token":user.data.api_token
      
    };
    const url = complaintService.appendParamsInUrl(`${API_URL2}/getcomplaintcategory`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
  },


    getComplaintLocations: async () => {
     const user = await Common.getLoggedInUser()
    const params = {
    "user-id":user.data.id,
    "api-token":user.data.api_token
      
    };
    const url = complaintService.appendParamsInUrl(`${API_URL2}/getAllCustomAndCommonArea`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
  },

      getComplaintComments : async (id) => {
     const user = await Common.getLoggedInUser()
     const uuid = await AsyncStorage.getItem('uuid');
    const params = {
        ref_uuid:uuid,
        ref_type:"WO",
        'api-token': user.data.api_token,
        'user-id': user.data.id,
        'api-token': user.data.api_token,
        'user-id': user.data.id,
      
    };
    const url = complaintService.appendParamsInUrl(`${API_URL2}/staff/comment/${id}`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
  },

  addComplaintComment : async (id, remark,file) => {
    const formData = new FormData();
    formData.append('remarks', remark);
    formData.append('comp_id', id);
    formData.append('file', file);
 
    const url = `${API_URL2}/staff/addcomment`;
    const headers = await Util.getCommonAuth()
    const response = await ApiCommon.postReq(url,null,headers,formData);
    return response
  },


  createComplaint : async (data) => {
    const resource = data.as
    const payload ={
      "complaint_type": data.category.id,
      "constant_society_id": data.society,
      "self_assign": data.selfAssign,
      "severity": "normal",
      "sub_category": data.data.name,
      "sub_category_id": data.data.id,
      "description":data.description,
      "file":data.image,
      data:JSON.stringify({resource})
      }

    const url = `${API_URL2}/addComplaint`;
    const headers = await Util.getCommonAuth()

    const res =  await ApiCommon.postReq(url, payload, headers);
    return res
  },


    closeComplaint : async (payload) => {
    const url = `${API_URL2}/staff/updatecomplaint`;
    const headers = await Util.getCommonAuth()
    const response =  await ApiCommon.putReq(url, payload, headers);
    return response;

  },






      getMyNotifications: async () => {
     const user = await Common.getLoggedInUser()

     const params = {
        "api-token": user.data.api_token,
        "user-id": user.data.id,
        "site-id": user.data.societyId,
        "per_page": 100,
        "page_no": 1,
      };

    const url = complaintService.appendParamsInUrl(`${API_URL2}/getmynotifications`, params);
    const headers = await Util.getCommonAuth()
    const  response  = await ApiCommon.getReq(url, headers);
    return response
  },

  

      getNfcUuid: async (id) => {
     const user = await Common.getLoggedInUser()

      const params = {
        "api-token": user.data.api_token,
        "user-id": user.data.id,
        "site-id": user.data.societyId,
        "site_id"  : user.data.society,
        "nfc_tag"  : id
          };

    const url = complaintService.appendParamsInUrl(`${API_URL}/v3/resource/assetorlocation`, params);
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
