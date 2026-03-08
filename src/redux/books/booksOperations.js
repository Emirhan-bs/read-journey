import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchRecommended = createAsyncThunk(
  "books/fetchRecommended",
  async (
    { page = 1, limit = 10, title = "", author = "" },
    { rejectWithValue },
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
  },
);

export const fetchLibrary = createAsyncThunk(
  "books/fetchLibrary",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/books/own");
      return Array.isArray(data) ? data : (data.books ?? []);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message);
    }
  },
);

export const addToLibrary = createAsyncThunk(
  "books/addToLibrary",
  async (book, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/books/add", {
        title: book.title,
        author: book.author,
        totalPages: Number(book.totalPages),
      });
      const result = data?.book ?? data;
      // Preserve imageUrl from the original recommended book object
      // since the API does not store or return imageUrl
      return { ...result, imageUrl: result.imageUrl || book.imageUrl || null };
    } catch (e) {
      if (e.response?.status === 409) {
        return rejectWithValue("This book is already in your library");
      }
      return rejectWithValue(e.response?.data?.message);
    }
  },
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
  },
);
