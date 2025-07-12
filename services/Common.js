//this deals with localstorage
import AsyncStorage from "@react-native-async-storage/async-storage";

const Common = {
    getLoggedInUser : async()=>{
try{


    const userInfo = await AsyncStorage.getItem('userInfo');
    // Check if userInfo exists before proceeding
    if (!userInfo) {
      throw new Error("User info not found");
    }

    // Parse the user info to get required data
    const parsedUserInfo = JSON.parse(userInfo);
    return parsedUserInfo;

}catch(e){
    console.log("Error in getLoggedInUser", e)
}

    },
    setLoggedInUser : (obj)=>{
        return localStorage.setItem("loggedinUserIndex", JSON.stringify(obj));
    },
    removeLoggedInUser : ()=>{
        return localStorage.removeItem("loggedinUserIndex");
    },
    getSiteObject : ()=>{
        let site = JSON.parse(localStorage.getItem("site"));
        if(site && site.data){
            site.data = JSON.parse(site.data)
            if(site.data && site.data.logo){
                site.image = site.data.logo
            }
            return site
        }
        return null
    }
}
export {Common};
