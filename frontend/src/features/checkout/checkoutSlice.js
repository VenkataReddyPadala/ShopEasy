import { createSlice } from "@reduxjs/toolkit";

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    selectedAddressId: null,
  },
  reducers: {
    setAddress: (state, action) => {
      state.selectedAddressId = action.payload;
    },
    resetCheckout: (state) => {
      state.selectedAddressId = null;
    },
  },
});

export const { setAddress, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
