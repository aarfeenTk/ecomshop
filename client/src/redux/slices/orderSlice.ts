import { createSlice } from "@reduxjs/toolkit";
import { OrderState, Order } from "../../types";

const initialState: OrderState = {
  order: null,
  updatingOrderId: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrder: (state, action: { payload: Order | null }) => {
      state.order = action.payload;
    },
    setUpdatingOrderId: (state, action: { payload: string | null }) => {
      state.updatingOrderId = action.payload;
    },
  },
});

export const { setOrder, setUpdatingOrderId } = orderSlice.actions;
export default orderSlice.reducer;
