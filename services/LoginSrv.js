import { ApiCommon } from "./ApiCommon";
import { Common } from "./Common";
import {API_URL} from "@env"
import { Util } from "./Util";

const LoginSrv = {
    isLogin: () => {
        let user = Common.getLoggedInUser()
        if (user) {
            let site = Common.getSiteObject()
            if(site && site.id === user.society.id){
                return user
            }else{
                LoginSrv.logout()
            }
        }
        return false;
    },
    logout: ()=>{
        Common.removeLoggedInUser()
        Common.removeHistory()
        window.location.reload(true);
    },
    login:(obj) =>{
        let ismUrl = API_URL + 'login';
        return ApiCommon.postReq(ismUrl, obj);
    },
    generateOtp: (obj) => {
        let ismUrl = process.env.REACT_APP_ISM_API_URL + 'generateotp';
        return ApiCommon.postReq(ismUrl, obj);
    },
    resendOtp: (obj) => {
        let ismUrl = process.env.REACT_APP_ISM_API_URL + 'resendotp';
        return ApiCommon.postReq(ismUrl, obj);
    },
    validateOtp: (obj) => {
        let ismUrl = process.env.REACT_APP_ISM_API_URL + 'validateotp';
        return ApiCommon.postReq(ismUrl, obj);
    },
    getMyAccounts: (token)=>{
        let ismUrl = process.env.REACT_APP_ISM_API_URL + 'getmyaccounts?token='+token;
        return ApiCommon.getReq(ismUrl);
    },
    continueLogin: (token, obj) =>{
        let ismUrl = process.env.REACT_APP_ISM_API_URL + 'logmein?token='+token;
        return ApiCommon.postReq(ismUrl, obj);
    },
    uploadFile: (file) => {
        var fd = new FormData();
        const config = {     
            headers: { 'content-type': 'multipart/form-data' }
        }
        fd.append('name', (Math.ceil(Math.random()*10000)+ '-' + file.name).replace(/\s/g, '_').replace(/\.[^/.]+$/, ""))
        fd.append('type', 'PUBLIC')
        fd.append('file', file)
        return ApiCommon.postReq(process.env.REACT_APP_DRS_API_URL +'publicupload', fd,config);
    },



   

    // // SIGNED APIS
    // updateProfile :(data)=>{
    //     return ApiCommon.putReq(Util.signUrl(process.env.REACT_APP_ISM_API_URL +'updateUserProfile'),data);
    // },
    // getLatestLoggedInUser :()=>{
    //     return ApiCommon.getReq(Util.signUrl(process.env.REACT_APP_ISM_API_URL +'getUserProfileData'));
    // },
    // logoutFromSrv :()=>{
    //     return ApiCommon.getReq(Util.signUrl(process.env.REACT_APP_ISM_API_URL +'logout'));
    // } 
}
export {LoginSrv};