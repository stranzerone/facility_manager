import mockData from './apis/SampleWo.json'; // assuming the JSON is saved in this file

export const getWorkOrdersByAssetUUID = (asset_uuid) => {
    console.log("getting wo for ",asset_uuid)
  if (!mockData?.data) return [];

  for (const location of mockData.data) {
    const asset = location.assets.find((a) => a.uuid === asset_uuid);
    if (asset) {
      console.log(asset.workorders,'this are found workorders')
      return asset.workorders || [];
    }
  }

  return []; // no match found
};
