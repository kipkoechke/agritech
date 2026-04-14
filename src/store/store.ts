import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    cart: cartReducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;
type AppStore = typeof store;
