import { createSlice } from "@reduxjs/toolkit";
import {
  fetchRecommended,
  fetchLibrary,
  addToLibrary,
  removeFromLibrary,
} from "./booksOperations";

const booksSlice = createSlice({
  name: "books",
  initialState: {
    recommended: [],
    totalPages: 0,
    currentPage: 1,
    library: [],
    filter: "all",
    isLoading: false,
    error: null,
  },
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommended.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRecommended.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommended = action.payload.results;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchRecommended.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchLibrary.fulfilled, (state, action) => {
        state.library = action.payload ?? [];
      })

      .addCase(addToLibrary.fulfilled, (state, action) => {
        const incoming = action.payload?.book ?? action.payload;
        if (!incoming?._id) return;
        const exists = state.library.some((b) => b._id === incoming._id);
        if (!exists) {
          state.library.push(incoming);
        }
      })

      .addCase(removeFromLibrary.fulfilled, (state, action) => {
        state.library = state.library.filter(
          (book) => book._id !== action.payload
        );
      });
  },
});

export const { setPage, setFilter } = booksSlice.actions;
export default booksSlice.reducer;

export const selectRecommended = (state) => state.books.recommended;
export const selectTotalPages = (state) => state.books.totalPages;
export const selectCurrentPage = (state) => state.books.currentPage;
export const selectLibrary = (state) => state.books.library;
export const selectFilter = (state) => state.books.filter;
export const selectBooksLoading = (state) => state.books.isLoading;