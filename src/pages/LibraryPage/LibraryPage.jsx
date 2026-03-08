import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLibrary,
  addToLibrary,
  removeFromLibrary,
  fetchRecommended,
} from "../../redux/books/booksOperations";
import {
  selectLibrary,
  selectFilter,
  setFilter,
  selectRecommended,
} from "../../redux/books/booksSlice";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon/Icon";
import Modal from "../../components/Modal/Modal";
import styles from "./LibraryPage.module.css";
import toast from "react-hot-toast";

const LibraryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const library = useSelector(selectLibrary);
  const recommended = useSelector(selectRecommended);
  const filter = useSelector(selectFilter);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectOpen, setSelectOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchLibrary());
    dispatch(fetchRecommended({ page: 1, limit: 3 }));
  }, [dispatch]);

  const handleAddBook = async (e) => {
    e.preventDefault();
    const form = e.target;
    const bookData = {
      title: form.title.value.trim(),
      author: form.author.value.trim(),
      totalPages: Number(form.totalPages.value),
    };
    const result = await dispatch(addToLibrary(bookData));
    if (addToLibrary.rejected.match(result)) {
      toast.error(result.payload);
    } else {
      toast.success("Book added!");
      form.reset();
    }
  };

  const handleRemove = async (e, bookId) => {
    e.stopPropagation();
    const result = await dispatch(removeFromLibrary(bookId));
    if (removeFromLibrary.rejected.match(result)) toast.error(result.payload);
    if (selectedBook?._id === bookId) setSelectedBook(null);
  };

  const filteredBooks = (library || []).filter((book) => {
    if (filter === "unread") return book.status === "unread";
    if (filter === "in-progress") return book.status === "in-progress";
    if (filter === "done") return book.status === "done";
    return true;
  });

  const filterOptions = [
    { value: "all", label: "All books" },
    { value: "unread", label: "Unread" },
    { value: "in-progress", label: "In progress" },
    { value: "done", label: "Done" },
  ];

  const recBooks = (recommended || []).slice(0, 3);

  return (
    <div className={styles.page} onClick={() => setSelectOpen(false)}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>

        {/* Add book form */}
        <div className={styles.addBook}>
          <p className={styles.sideTitle}>Create your library:</p>
          <form onSubmit={handleAddBook} className={styles.form}>
            <label className={styles.inputRow}>
              <span className={styles.inputLabel}>Book title:</span>
              <input name="title" className={styles.inputField} placeholder="Enter text" required />
            </label>
            <label className={styles.inputRow}>
              <span className={styles.inputLabel}>The author:</span>
              <input name="author" className={styles.inputField} placeholder="Enter text" required />
            </label>
            <label className={styles.inputRow}>
              <span className={styles.inputLabel}>Number of pages:</span>
              <input
                name="totalPages" type="number" min="1"
                className={styles.inputField} placeholder="0" required
              />
            </label>
            <button type="submit" className={styles.addBtn}>Add book</button>
          </form>
        </div>

        {/* Recommended books — 3-col horizontal grid */}
        {recBooks.length > 0 && (
          <div className={styles.recBlock}>
            <p className={styles.recTitle}>Recommended books</p>
            <ul className={styles.recGrid}>
              {recBooks.map((book) => (
                <li key={book._id} className={styles.recCard}>
                  <div className={styles.recImgWrap}>
                    {book.imageUrl
                      ? <img src={book.imageUrl} alt={book.title} className={styles.recImg} />
                      : <div className={styles.recImgEmpty} />}
                  </div>
                  <p className={styles.recBookTitle}>{book.title}</p>
                  <p className={styles.recAuthor}>{book.author}</p>
                </li>
              ))}
            </ul>
            <a href="/recommended" className={styles.homeLink}>
              Home
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <section className={styles.content}>
        <div className={styles.contentHeader}>
          <h2 className={styles.contentTitle}>My library</h2>

          {/* Filter */}
          <div className={styles.filterWrap} onClick={(e) => e.stopPropagation()}>
            <button
              className={`${styles.filterBtn} ${selectOpen ? styles.filterBtnOpen : ""}`}
              onClick={() => setSelectOpen((p) => !p)}
            >
              {filterOptions.find((o) => o.value === filter)?.label}
              <svg
                className={selectOpen ? styles.chevronUp : styles.chevronDown}
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            {selectOpen && (
              <ul className={styles.dropdown}>
                {filterOptions.map((opt) => (
                  <li
                    key={opt.value}
                    className={`${styles.dropItem} ${filter === opt.value ? styles.dropItemActive : ""}`}
                    onClick={() => { dispatch(setFilter(opt.value)); setSelectOpen(false); }}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className={styles.empty}>No books in this category yet.</div>
        ) : (
          <ul className={styles.bookGrid}>
            {filteredBooks.map((book) => (
              <li key={book._id} className={styles.bookCard} onClick={() => setSelectedBook(book)}>
                {/* Cover image */}
                <div className={styles.bookCover}>
                  {book.imageUrl
                    ? <img src={book.imageUrl} alt={book.title} className={styles.bookCoverImg} />
                    : (
                      <div className={styles.bookCoverEmpty}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff20" strokeWidth="1.2">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                      </div>
                    )}
                </div>
                {/* Info row: title+author left, trash right */}
                <div className={styles.bookInfoRow}>
                  <div className={styles.bookMeta}>
                    <p className={styles.bookTitle}>{book.title}</p>
                    <p className={styles.bookAuthor}>{book.author}</p>
                  </div>
                  <button
                    className={styles.trashBtn}
                    onClick={(e) => handleRemove(e, book._id)}
                    title="Remove"
                  >
                    {/* inline SVG trash so no icon dependency */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Modal ── */}
      {selectedBook && (
        <Modal onClose={() => setSelectedBook(null)}>
          <div className={styles.modal}>
            {selectedBook.imageUrl
              ? <img src={selectedBook.imageUrl} alt={selectedBook.title} className={styles.modalImg} />
              : (
                <div className={styles.modalImgEmpty}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ffffff20" strokeWidth="1.2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
              )}
            <h3 className={styles.modalTitle}>{selectedBook.title}</h3>
            <p className={styles.modalAuthor}>{selectedBook.author}</p>
            <p className={styles.modalPages}>{selectedBook.totalPages} pages</p>
            <button className={styles.startBtn} onClick={() => navigate(`/reading/${selectedBook._id}`)}>
              Start reading
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LibraryPage;