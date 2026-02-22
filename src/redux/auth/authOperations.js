import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
// Register
export const register = createAsyncThunk(
  "auth/register",
  async (useRouteLoaderData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/signup", useRouteLoaderData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

// Login
export const login = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/signin", userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

// Logout
export const logout = createAsyncThunk(
  "auth/signout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/signout");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

// Refresh User
export const refreshUser = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/current");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "User refresh failed",
      );
    }
  },
);
