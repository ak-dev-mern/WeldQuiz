import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  username: Cookies.get("username") || null,
  role: Cookies.get("role") || null,
  token: Cookies.get("token") || null,
  email: Cookies.get("email") || null,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setStudent: (state, action) => {
      state.username = action.payload.username;
      state.role = action.payload.role;
      state.email = action.payload.email;
      state.token = action.payload.token;

      // Store in cookies
      Cookies.set("username", action.payload.username, {
        expires: 7,
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("role", action.payload.role, {
        expires: 7,
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("email", action.payload.email, {
        expires: 7,
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("token", action.payload.token, {
        expires: 7,
        secure: true,
        sameSite: "Strict",
      });
    },
    logoutStudent: (state) => {
      state.username = null;
      state.role = null;
      state.email = null;
      state.token = null;

      // Remove from cookies
      Cookies.remove("token");
      Cookies.remove("role");
      Cookies.remove("username");
      Cookies.remove("email");
    },
  },
});

export const { setStudent, logoutStudent } = studentSlice.actions;
export default studentSlice.reducer;
