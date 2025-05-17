import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For persistent storage
import assetsReducer from "../Slices/AssetSlice";
import workOrdersReducer from "../Slices/WorkOrderSlice";
import buggyListReducer from "../Slices/BuggyListSlice";
import complaintsReducer from "../Slices/ComplaintsSlice";
import notificationsReducer from "../Slices/NotificationsSlice";
import usersReducer from "../Slices/UsersSlice";
import teamsReducer from "../Slices/TeamSlice";
import pmsReducer from "../Slices/PmsSlice"
// Persist Configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['workOrders', 'assets', 'buggyList', 'complaints', 'notifications','users','teams'], // List slices you want to persist
};

// Combine all reducers
const rootReducer = combineReducers({
  buggyList: buggyListReducer,
  assets: assetsReducer,
  workOrders: workOrdersReducer,
  complaints: complaintsReducer,
  notifications: notificationsReducer,
  users: usersReducer,
  teams: teamsReducer,
  pms:pmsReducer
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Redux Persist requires disabling serializable check
    }),
});

// Create a persistor
const persistor = persistStore(store);

export { store, persistor };
