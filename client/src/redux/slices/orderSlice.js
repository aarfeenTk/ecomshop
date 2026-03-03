import { createSlice } from '@reduxjs/toolkit';

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    order: null,
    updatingOrderId: null,
  },
  reducers: {
    setOrder: (state, action) => {
      state.order = action.payload;
    },
    setUpdatingOrderId: (state, action) => {
      state.updatingOrderId = action.payload;
    },
  },
});

export const { setOrder, setUpdatingOrderId } = orderSlice.actions;
export default orderSlice.reducer;
