import { createSlice } from "@reduxjs/toolkit";
import { ProductState } from "../../types";

const initialState: ProductState = {
  product: null,
  deletingId: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearDeletingState: (state) => {
      state.deletingId = null;
    },
    setProduct: (state, action: { payload: ProductState["product"] }) => {
      state.product = action.payload;
    },
  },
});

export const { clearDeletingState, setProduct } = productSlice.actions;
export default productSlice.reducer;
