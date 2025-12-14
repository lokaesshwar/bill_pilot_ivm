import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  invoices: [],
};

export const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    setInvoices(state, action) {
      state.invoices = action.payload;
    },
  },
});

export const { setInvoices } = invoicesSlice.actions;

export default invoicesSlice.reducer;
