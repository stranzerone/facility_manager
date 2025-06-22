import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiCommon } from "../ApiCommon";
import { Util } from "../Util";
import { API_URL, API_URL3, API_URL2 } from "@env";
import { Common } from "../Common";

export const InventoryServices = {


    getWareHouseStatus: async () => {
        const societyInfo = await AsyncStorage.getItem('societyInfo');

        const site_uuid = JSON.parse(societyInfo);

        const params = {
            site_id: site_uuid
        }

        const url = InventoryServices.appendParamsInUrl(`${API_URL}/v3/warehouse?`, params);
        const headers = await Util.getCommonAuth()
        return await ApiCommon.getReq(url, headers);
    },


    getAllIssueRequests: async (uuid) => {

        const user = await Common.getLoggedInUser()
        const params = {
            site_id: user.data.societyId,
            warehouse_id: uuid,
            Status: "DRAFT",
            created_by: user.data.id,
            per_page: 20,
            user_id: user.data.id,
        };


        const url = InventoryServices.appendParamsInUrl(`${API_URL}/v3/issue/request?`, params);
        const headers = await Util.getCommonAuth()
        return await ApiCommon.getReq(url, headers);
    },



    getAllIssueItems: async (uuid, category) => {
        const societyInfo = await AsyncStorage.getItem('societyInfo');

        const site_uuid = JSON.parse(societyInfo);
        const params = {
            site_uuid: site_uuid,
            warehouse_id: uuid,
            page: 1,
            per_page: 1000
        };
        if (category) {
            params.category_id = category
        }


        const url = InventoryServices.appendParamsInUrl(`${API_URL}/v3/item/nodes`, params);
        const headers = await Util.getCommonAuth()
        return await ApiCommon.getReq(url, headers);
    },


    getAllTaxes: async (uuid) => {

        const user = await Common.getLoggedInUser()
        const societyInfo = await AsyncStorage.getItem('societyInfo');

        const site_uuid = JSON.parse(societyInfo);
        const params = {
            site_uuid: site_uuid,
            warehouse_id: uuid,
        };


        const url = InventoryServices.appendParamsInUrl(`${API_URL}/v3/taxes`, params);
        const headers = await Util.getCommonAuth()
        return await ApiCommon.getReq(url, headers);
    },


    getAllCategories: async (uuid) => {
        const societyInfo = await AsyncStorage.getItem('societyInfo');

        const site_uuid = JSON.parse(societyInfo);

        const user = await Common.getLoggedInUser()
        const params = {
            site_uuid: site_uuid,

        };


        const url = InventoryServices.appendParamsInUrl(`${API_URL}/v3/category/item`, params);
        const headers = await Util.getCommonAuth()
        return await ApiCommon.getReq(url, headers);
    },


    getIssueInfo: async (uuid) => {
        const params = {
            uuid: uuid
        };

        const url = InventoryServices.appendParamsInUrl(`${API_URL}/v3/issue/request/uuid`, params);
        const headers = await Util.getCommonAuth()
        return await ApiCommon.getReq(url, headers);
    },


    getApprovalList: async () => {

        const user = await Common.getLoggedInUser()
        const params = {
            site_id: user.data.societyId,
            type: "RQ"
        }


        const url = InventoryServices.appendParamsInUrl(`${API_URL}/v3/approvals`, params);
        const headers = await Util.getCommonAuth()
        const response  = await ApiCommon.getReq(url, headers);
        console.log(response,'this is approval list')
        return response
    },

    requestApproval: async (mpayload) => {
        const societyInfo = await AsyncStorage.getItem('societyInfo');
       console.log(mpayload)
        const site_uuid = JSON.parse(societyInfo);
        const user = await Common.getLoggedInUser()
         console.log(user,'this is user')
        // Construct the dynamic payload (mpayload)
        const payload = {
            ...mpayload.issue,  // Copy all fields from issue
            Status: "PENDING",  // Override status with 'PENDING'
            site_uuid:  site_uuid,  // Add site_uuid
            line_items: mpayload.item,  // Directly pass the item array
            updated_by: user.data.id
        };
        console.log(payload,'this is paylod for approve')
        const url = `${API_URL}/v3/stock/request`;
        const headers = await Util.getCommonAuth()
        const response = await ApiCommon.putReq(url, payload, headers);
        return response
    },


    createIssueRequest: async (itemsData, itemList) => {

        let user = await Common.getLoggedInUser()
        const societyInfo = await AsyncStorage.getItem('societyInfo');

        const site_uuid = JSON.parse(societyInfo);

        itemsData.site_uuid = site_uuid;
        itemsData.created_by = user.data.id;

        const payload = {
            ...itemsData,
            line_items: itemList,
            user_id: user.data.id
        }
        console.log(payload,'this is paylod for add item')
        const url = `${API_URL}/v3/stock/request`;
        const headers = await Util.getCommonAuth()

        return await ApiCommon.postReq(url, payload, headers);
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
