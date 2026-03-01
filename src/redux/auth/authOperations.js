import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/users/signup', data);
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message);
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/users/signin', data);
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/users/signout');
  } catch (e) {
    return rejectWithValue(e.response?.data?.message);
  }
});

export const refreshUser = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/users/current');
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message);
  }
});