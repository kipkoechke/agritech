import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
