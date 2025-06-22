// offline/syncQueuedWorkOrders.js
import { getQueue, clearQueue, deleteFile } from "./fileOperations";
import { workOrderService } from "../services/apis/workorderApis";
import { complaintService } from "../services/apis/complaintApis";

export const syncQueuedWorkOrders = async () => {
  try {
    const queue = await getQueue('workorder');
    if (queue.length === 0) return;
    for (const payload of queue) {
      try {
      await workOrderService.createWorkOrder(payload);
    
      } catch (e) {
        console.log("❌ Failed to sync one item:", e);
      }
    }
    await clearQueue('workorder');


  } catch (e) {
    console.log("❌ Error syncing queue", e);
  }
};

export const syncQueuedComplaints = async () => {
  try {
    const queue = await getQueue('complaint');
    console.log("length of the queue for complaints is ",queue.length)
    if (queue.length === 0) return;

    for (const payload of queue) {
      try {
     const response =  await complaintService.createComplaint(payload);
     if(response.status == "Success"){
        await clearQueue('complaint');
     }
      } catch (e) {
        console.log("❌ Failed to sync one item:", e);
      }
    }


  } catch (e) {
    console.log("❌ Error syncing queue", e);
  }
};


export const syncQueuedCloseComplaints = async () => {
  try {
    console.log("Syncing close complaints...");
    const queue = await getQueue('closeComplaint');
    console.log("length of the queue for close complaints is ",queue.length)
    if (queue.length === 0) return;

    for (const payload of queue) {
      try {
     const response =  await complaintService.closeComplaint(payload);
     console.log("Response for close closeComplaint:", response);
     if(response){
        await clearQueue('closeComplaint');
        console.log("🧹 Queue cleared after sync for close complaints.");
     }
      } catch (e) {
        console.log("❌ Failed to sync one item:", e);
      }
    }


  } catch (e) {
    console.log("❌ Error syncing queue", e);
  }
};


export const syncQueuedWoComments = async () => {
  try {
    const queue = await getQueue('woComments');
    console.log("length of the queue for woComments is ",queue.length)
    if (queue.length === 0) return;

    for (const payload of queue) {
      try {
     const response =  await workOrderService.addComments(payload);
     if(response.status == "Success"){
        await clearQueue('woComments');
        console.log("🧹 Queue cleared after sync.");
     }
        console.log("✅ Synced:", payload.Name);
      } catch (e) {
        console.log("❌ Failed to sync one item:", e);
      }
    }


  } catch (e) {
    console.log("❌ Error syncing queue", e);
  }
};


export const syncPdfFiles = async () => {
  try {
    const queue = await getQueue('pdfFile');
    console.log("Queue length for pdf upload:", queue.length);
    if (queue.length === 0) return;

    console.log("Syncing pdf files...");
    let allSynced = true;

    for (const payload of queue) {
      try {
        const response = await workOrderService.addPdfToServer(payload);
         console.log(payload,'this is response pdf paylod from pdf before update for pdf')
        if(response.data.url){
          console.log("response received moving to update with url :",response.url)
          const insPayload = {
            id: payload.id,
            result:response.data.url,
            remarks:""
          }
          console.log(insPayload,"this is inst paylod on pdf")
          const insResponse = await workOrderService.updateInstruction(insPayload)
          return insResponse

        }
      } catch (e) {
        allSynced = false;
        console.log("❌ Error syncing one item:", e);
      }
    }

    if (allSynced) {
      await deleteFile('pdfFile');
      console.log("🧹 Queue cleared after successful sync for pdf files.");
    } else {
      console.log("⚠️ Some items failed, queue not cleared.");
    }
  } catch (e) {
    console.log("❌ Error syncing queue", e);
  }
};




export const syncUpdateInstructions = async () => {
  let allsynced = true;
  try {
    const queue = await getQueue('updateInstruction');
    console.log("Queue length for updated insturctions :", queue.length);
    if (queue.length === 0) return;

    for (const data of queue) {
      try {
        console.log(data,'this is data for upding inst ques')
        await workOrderService.updateInstruction(data);
      } catch (e) {
        allsynced = false
        console.log("❌ Failed to sync one item:", e);
      }finally{
        if(allsynced){
          await clearQueue('updateInstruction');
          console.log("queue cleared for update inst")
        }
      }
    }


  } catch (e) {
    console.log("❌ Error syncing queue", e);
  }
};