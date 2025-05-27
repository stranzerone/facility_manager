import { ApiCommon } from "../ApiCommon";
import { Common } from "../Common";
import { Util } from "../Util";
import { API_URL2 } from "@env";

export const complaintService = {
  getAllComplaints: async (params) => {
    const url = complaintService.appendParamsInUrl(`${API_URL2}/staff/mycomplaints`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
  },


  getComplaintCategories: async (params) => {
    const url = complaintService.appendParamsInUrl(`${API_URL2}/getcomplaintcategory`, params);
    const headers = await Util.getCommonAuth()
    return await ApiCommon.getReq(url, headers);
  },




  createComplaint : async (data) => {
    const payload ={
      "complaint_type": data.category.id,
      "constant_society_id": data.society,
      "self_assign": data.selfAssign,
      "severity": "normal",
      "sub_category": data.data.name,
      "sub_category_id": data.data.id,
      "description":data.description,
      "file":data.image,
      }

 
    const url = `${API_URL2}/addComplaint`;
    const headers = await Util.getCommonAuth()

    return await ApiCommon.postReq(url, payload, headers);
  },


    closeComplaint : async (payload) => {
     let user = await Common.getLoggedInUser()
    console.log(user, "user in close complaint service")



 console.log(payload,'this is paylod for clsoe complaint')
    const url = `${API_URL2}/staff/updatecomplaint`;
    const headers = await Util.getCommonAuth()
    const response =  await ApiCommon.putReq(url, payload, headers);
    console.log(response,'this is for clsoe complaint')
    return response;

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
