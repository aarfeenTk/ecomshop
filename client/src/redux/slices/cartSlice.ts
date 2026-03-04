import { createSlice } from "@reduxjs/toolkit";
import { CartState, CartItem } from "../../types";

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
    setCart: (state, action: { payload: CartItem[] }) => {
      state.items = action.payload;
    },
  },
});

export const { clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;
