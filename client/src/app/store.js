import { configureStore } from "@reduxjs/toolkit";
import invoicesReducer from "../features/invoicesSlice";
export const store = configureStore({
  reducer: {
    invoices: invoicesReducer,
  },
});
