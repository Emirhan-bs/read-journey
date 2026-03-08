import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchRecommended = createAsyncThunk(
  "books/fetchRecommended",
  async (
    { page = 1, limit = 10, title = "", author = "" },
    { rejectWithValue }
  ) => {
    try {
      const params = { page, limit };
      if (title) params.title = title;
      if (author) params.author = author;
      const { data } = await api.get("/books/recommend", { params });
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

export const fetchLibrary = createAsyncThunk(
  "books/fetchLibrary",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/books/own");
      // API may return array directly or { books: [...] }
      return Array.isArray(data) ? data : (data.books ?? []);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

export const addToLibrary = createAsyncThunk(
  "books/addToLibrary",
  async (book, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.post("/books/add", {
        title: book.title,
        author: book.author,
        totalPages: Number(book.totalPages),
      });
      // Re-fetch the full library so imageUrl and all fields are up to date
      dispatch(fetchLibrary());
      return data;
    } catch (e) {
      if (e.response?.status === 409) {
        return rejectWithValue("This book is already in your library");
      }
      return rejectWithValue(e.response?.data?.message);
    }
  }
);

export const removeFromLibrary = createAsyncThunk(
  "books/removeFromLibrary",
  async (bookId, { rejectWithValue }) => {
    try {
      await api.delete(`/books/remove/${bookId}`);
      return bookId;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  }
);