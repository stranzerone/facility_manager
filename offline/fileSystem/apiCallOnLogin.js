import { workOrderService } from "../services/apis/workorderApis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { writeToFile } from "../fileSystem/fileOperations";
import { complaintService } from "../services/apis/complaintApis";

export const apiCallOnLogin = async () => {
  try {
    const userInfo = await AsyncStorage.getItem('userInfo');
    if (!userInfo) throw new Error("User info not found");

    const parsedUserInfo = JSON.parse(userInfo);
    const userId = parsedUserInfo.data.id;
    const apiToken = parsedUserInfo.data.api_token;
    const societyId = parsedUserInfo.data.societyId;

    const workorderParams = {
      site_id: societyId,
      breakdown1: false,
      breakdown2: false,
      breakdown: false,
      page_no: 1,
      user_id: userId,
      'api-token': apiToken,
    };

    const complaintParams = {
      all: 1,
      page_no: 1,
      per_page: 50,
      'api-token': apiToken,
      'user-id': userId,
    };

    // 🔵 OPEN work orders
    const openResponse = await workOrderService.getAllWorkOrders({
      ...workorderParams,
      Status: "OPEN",
    });
    await writeToFile('openWorkorders.json', openResponse);

    // 🟢 COMPLETED work orders
    const completedResponse = await workOrderService.getAllWorkOrders({
      ...workorderParams,
      Status: "COMPLETED",
    });
    await writeToFile('completedWorkorders.json', completedResponse);

    // 🟡 Complaints
    const complaintsResponse = await complaintService.getAllComplaints(complaintParams);
    await writeToFile('myComplaints.json', complaintsResponse);



    const complaintsCategoriesResponse = await complaintService.getComplaintCategories();
    await writeToFile('complaintCategories.json', complaintsCategoriesResponse);
    

    console.log("✅ Data saved for work orders and complaints.");
    
  } catch (e) {
    console.log("❌ Error in apiCallOnLogin:", e);
  }
};
