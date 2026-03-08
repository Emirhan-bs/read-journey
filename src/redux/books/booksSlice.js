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
    // Persistent map of bookId -> imageUrl so fetchLibrary never wipes covers
    imageCache: {},
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
        // Build imageCache from recommended list (title+author -> imageUrl)
        action.payload.results.forEach((book) => {
          if (book.imageUrl) {
            const key = `${book.title}||${book.author}`;
            state.imageCache[key] = book.imageUrl;
          }
        });
      })
      .addCase(fetchRecommended.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchLibrary — patch imageUrl from cache so server's null never wins
      .addCase(fetchLibrary.fulfilled, (state, action) => {
        const books = action.payload ?? [];
        state.library = books.map((book) => {
          if (book.imageUrl) return book;
          const key = `${book.title}||${book.author}`;
          const cached = state.imageCache[key];
          return cached ? { ...book, imageUrl: cached } : book;
        });
      })

      // addToLibrary — save imageUrl to cache, then store book with image
      .addCase(addToLibrary.fulfilled, (state, action) => {
        const incoming = action.payload;
        if (!incoming?._id) return;

        // Persist imageUrl in cache so future fetchLibrary calls don't lose it
        if (incoming.imageUrl) {
          const key = `${incoming.title}||${incoming.author}`;
          state.imageCache[key] = incoming.imageUrl;
        }

        const exists = state.library.some((b) => b._id === incoming._id);
        if (!exists) state.library.push(incoming);
      })

      .addCase(removeFromLibrary.fulfilled, (state, action) => {
        state.library = state.library.filter((b) => b._id !== action.payload);
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
