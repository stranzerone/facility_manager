import { useEffect, useState } from "react";

// 🧩 Import your actual API functions here
import { getOpenWorkOrders } from "../api/workOrders";
import { getUpcomingWorkOrders } from "../api/upcoming";
import { getHousekeeping } from "../api/housekeeping";
import { getBreakdowns } from "../api/breakdowns";
import { getEscalations } from "../api/escalations";

// ⚠️ This hook only handles keys that require API fetch
const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 const tabKey = "OW"
  const fetchTabData = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;

      switch (tabKey) {
        case "OW":
            if(uuid){
           response = await getOpenWorkOrders();
            }else{
          response = await getOpenWorkOrders();
            }
          break;
        case "UW":
          response = await getUpcomingWorkOrders();
          break;
        case "HK":
          response = await getHousekeeping();
          break;
        case "BD":
          response = await getBreakdowns();
          break;
        case "ME":
          response = await getEscalations();
          break;
        // "OC" and "INV" not handled here
        default:
          console.warn(`No API mapping found for tabKey: ${tabKey}`);
          return;
      }

      setData(response?.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabKey && tabKey !== "OC" && tabKey !== "INV") {
      fetchTabData();
    }
  }, [tabKey]);

  return { data, loading, error };
};

export default useDashboardData;
