import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  creators: [],
};

export const appSlice = createSlice({
  name: "creators",
  initialState,
  reducers: {
    setCrs: (state, action) => {
      state.creators = action.payload;
    },
  },
});

export const { setCrs } = appSlice.actions;

export default appSlice.reducer;
