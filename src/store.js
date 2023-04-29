import { configureStore } from "@reduxjs/toolkit";
import crReducer from "./slices/AppSlice";

const store = configureStore({
  reducer: {
    creators: crReducer,
  },
});

export default store;
