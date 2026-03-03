import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: {
    product: null,
    deletingId: null,
  },
  reducers: {
    clearDeletingState: (state) => {
      state.deletingId = null;
    },
    setProduct: (state, action) => {
      state.product = action.payload;
    },
  },
});

export const { clearDeletingState, setProduct } = productSlice.actions;
export default productSlice.reducer;
