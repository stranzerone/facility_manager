// ./app/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import assetsReducer from './AssetSlice'; // Import the reducer

const store = configureStore({
  reducer: {
    assets: assetsReducer // Add the assets reducer to the store
  }
});

export default store;
