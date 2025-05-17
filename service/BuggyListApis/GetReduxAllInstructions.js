import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDataByUuid } from '../../utils/Slices/BuggyListSlice';
import { selectWorkOrders } from '../../utils/Slices/WorkOrderSlice';

const StoreBuggyListRedux = () => {
  const dispatch = useDispatch();
  const workOrders = useSelector(selectWorkOrders);

  useEffect(() => {
    if (workOrders && workOrders.length > 0) {
      workOrders.forEach((element) => {
        dispatch(fetchDataByUuid(element.wo.uuid));
      });
    }
  }, [dispatch, workOrders]); // Only re-run if workOrders change

  return null; // No UI needed here; this component is purely for dispatching
};

export default StoreBuggyListRedux;
