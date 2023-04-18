import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  barbers: [],
  withdrawals: [],
  shaves: [],
  settings: {},
};

export const appSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    getBarbers: (state) => {
      return state.users;
    },
    getWithdrawals: (state) => {
      return state.users;
    },
    getShaves: (state) => {
      return state.users;
    },
    getSettings: (state) => {
      return state.users;
    },
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
  },
});

export const { getUsers, addUser } = appSlice.actions;

export default appSlice.reducer;
