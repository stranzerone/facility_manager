import AsyncStorage from "@react-native-async-storage/async-storage";
import { writeToFile, readFromFile } from "../fileSystem/fileOperations";
import { workOrderService } from "../services/apis/workorderApis";
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

    // 🔵 Fetch and store work orders
    const fetchWorkOrders = async () => {
      const openResponse = await workOrderService.getAllWorkOrders({
        ...workorderParams,
        Status: "OPEN",
      });
      await writeToFile('openWorkorders.json', openResponse);

      const completedResponse = await workOrderService.getAllWorkOrders({
        ...workorderParams,
        Status: "COMPLETED",
      });
      await writeToFile('completedWorkorders.json', completedResponse);
    };

    // 🟡 Fetch and store complaints
    const fetchComplaints = async () => {
      const complaintsResponse = await complaintService.getAllComplaints(complaintParams);
      await writeToFile('myComplaints.json', complaintsResponse);

      const complaintsCategoriesResponse = await complaintService.getComplaintCategories();
      await writeToFile('complaintCategories.json', complaintsCategoriesResponse);
    };

    // 📄 Fetch and store work order instructions
    const fetchInstructionsForWorkOrders = async () => {
      
      const openData = await readFromFile('openWorkorders.json');
      const parsedOpenData = JSON.parse(openData);
      if (!parsedOpenData.data || !Array.isArray(parsedOpenData.data)) {
        throw new Error("Invalid or missing openWorkorders data");
      }
      console.log("fetching instructions for work orders...")
    
      for (const item of parsedOpenData.data) {
        const wo = item.wo;
        console.log(wo,'this is the wo')
        if (wo?.uuid) {
          try {
            const instructionResponse = await workOrderService.getInstructionsForWo( {ref_uuid:wo.uuid,ref_type:"WO"});
            console.log(instructionResponse,'this is the instruction response')
            await writeToFile(`woInstruction-${wo.uuid}.json`, instructionResponse);
          } catch (innerErr) {
            console.log(`❌ Error fetching instruction for WO ${wo.uuid}:`, innerErr.message);
          }
        }
      }
    };



    const fetchInstructionsComments = async () => {
      const openData = await readFromFile('openWorkorders.json');
      const parsedOpenData = JSON.parse(openData);
      if (!parsedOpenData.data || !Array.isArray(parsedOpenData.data)) {
        throw new Error("Invalid or missing openWorkorders data");
      }
    
      for (const item of parsedOpenData.data) {
        const wo = item.wo;
        if (wo?.uuid) {
          try {


            const params = {
              ref_uuid:wo.uuid,
              type:"WO",
              order:"desc",
              page_no:1,
              per_page:100,
              'api-token': apiToken,
              'user-id':userId,
              'api-token': apiToken,
              'user-id':userId,
              
            };

            const commentsResponse = await workOrderService.getInstructionsComments(params);
            await writeToFile(`instructionComments-${wo.uuid}.json`, commentsResponse);
          
          } catch (innerErr) {
            console.log(`❌ Error fetching instruction for WO ${wo.uuid}:`, innerErr.message);
          }
        }
      }
    };



    const fetchInstructionsDetails = async () => {
      const openData = await readFromFile('openWorkorders.json');
      const parsedOpenData = JSON.parse(openData);
      if (!parsedOpenData.data || !Array.isArray(parsedOpenData.data)) {
        throw new Error("Invalid or missing openWorkorders data");
      }
    
      for (const item of parsedOpenData.data) {
        const wo = item.wo;
        if (wo?.uuid) {
          try {


            const params = {
   
    
              uuid:wo.uuid,
              site_id: societyId,
              'api-token': apiToken,
              'user-id ':userId,
              'api-token': apiToken,
             'user-id ':userId,
            };

            const instructionDetails = await workOrderService.getInstructionsDetails(params);
            await writeToFile(`instructionDetails-${wo.uuid}.json`, instructionDetails);
          
          } catch (innerErr) {
            console.log(`❌ Error fetching instruction details ${wo.uuid}:`, innerErr.message);
          }
        }
      }
    };




        // 🔁 Execute all fetches
    await fetchWorkOrders();
    await fetchComplaints();
    await fetchInstructionsForWorkOrders();
    await fetchInstructionsComments();
    await fetchInstructionsDetails();
    console.log("✅ All data synced and stored.");

  } catch (e) {
    console.log("❌ Error in apiCallOnLogin:", e.message);
  }
};
