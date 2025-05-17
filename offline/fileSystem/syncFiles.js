// offline/syncQueuedWorkOrders.js
import { getQueue, clearQueue } from "./fileOperations";
import { workOrderService } from "../services/apis/workorderApis";
import { complaintService } from "../services/apis/complaintApis";

export const syncQueuedWorkOrders = async () => {
  try {
    const queue = await getQueue('workorder');
    if (queue.length === 0) return;

    for (const payload of queue) {
      try {
     const response =    await workOrderService.createWorkOrder(payload);
     if(response.status == "Success"){
        await clearQueue('workorder');
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

export const syncQueuedComplaints = async () => {
  try {
    console.log("Syncing complaints...");
    const queue = await getQueue('complaint');
    console.log("Queue length:", queue.length);
    if (queue.length === 0) return;

    for (const payload of queue) {
      try {
     const response =  await complaintService.createComplaint(payload);
     console.log("Response for add complaint:", response);
     if(response.status == "Success"){
        await clearQueue('complaint');
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