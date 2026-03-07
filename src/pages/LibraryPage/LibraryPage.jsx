import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLibrary,
  addToLibrary,
  removeFromLibrary,
} from "../../redux/books/booksOperations";
import {
  selectLibrary,
  selectFilter,
  setFilter,
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
  const filter = useSelector(selectFilter);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectOpen, setSelectOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchLibrary()).then((result) => {
      console.log("fetchLibrary result:", JSON.stringify(result.payload));
    });
  }, [dispatch]);

  const handleAddBook = async (e) => {
    e.preventDefault();
    const form = e.target;
    const bookData = {
      title: form.title.value,
      author: form.author.value,
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

  const handleRemove = async (bookId) => {
    const result = await dispatch(removeFromLibrary(bookId));
    if (removeFromLibrary.rejected.match(result)) toast.error(result.payload);
    setSelectedBook(null);
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

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.addBook}>
          <p className={styles.sideTitle}>Create your library:</p>
          <form onSubmit={handleAddBook} className={styles.form}>
            <div className={styles.inputWrap}>
              <label className={styles.label}>Book title:</label>
              <input
                name="title"
                className={styles.input}
                placeholder="Enter text"
                required
              />
            </div>
            <div className={styles.inputWrap}>
              <label className={styles.label}>The author:</label>
              <input
                name="author"
                className={styles.input}
                placeholder="Enter text"
                required
              />
            </div>
            <div className={styles.inputWrap}>
              <label className={styles.label}>Number of pages:</label>
              <input
                name="totalPages"
                type="number"
                min="1"
                className={styles.input}
                placeholder="0"
                required
              />
            </div>
            <button type="submit" className={styles.addBtn}>
              Add book
            </button>
          </form>
        </div>

        <div className={styles.recommendedBlock}>
          <p className={styles.sideTitle}>Recommended books</p>
          <ul className={styles.recommendedList}>
            {(library || []).slice(0, 3).map((book) => (
              <li key={book._id} className={styles.recommendedCard}>
                <div className={styles.recommendedImgWrap}>
                  {book.imageUrl ? (
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className={styles.recommendedImg}
                    />
                  ) : (
                    <Icon id="mobil-logo" width={42} height={17} />
                  )}
                </div>
                <div>
                  <p className={styles.recommendedTitle}>{book.title}</p>
                  <p className={styles.recommendedAuthor}>{book.author}</p>
                </div>
              </li>
            ))}
          </ul>
          <a href="/recommended" className={styles.homeLink}>
            Home <Icon id="arrow" width={24} height={24} />
          </a>
        </div>
      </aside>

      <section className={styles.content}>
        <div className={styles.contentHeader}>
          <h2 className={styles.contentTitle}>My library</h2>
          <div className={styles.selectWrap}>
            <button
              className={styles.selectBtn}
              onClick={() => setSelectOpen((p) => !p)}
            >
              {filterOptions.find((o) => o.value === filter)?.label}
              <Icon
                id="arrow"
                width={20}
                height={20}
                className={selectOpen ? styles.arrowUp : styles.arrowDown}
              />
            </button>
            {selectOpen && (
              <ul className={styles.dropdown}>
                {filterOptions.map((opt) => (
                  <li
                    key={opt.value}
                    className={`${styles.dropdownItem} ${filter === opt.value ? styles.dropdownActive : ""}`}
                    onClick={() => {
                      dispatch(setFilter(opt.value));
                      setSelectOpen(false);
                    }}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className={styles.empty}>
            <p>No books in this category yet.</p>
          </div>
        ) : (
          <ul className={styles.bookList}>
            {filteredBooks.map((book) => (
              <li
                key={book._id}
                className={styles.bookCard}
                onClick={() => setSelectedBook(book)}
              >
                <div className={styles.bookImgWrap}>
                  {book.imageUrl ? (
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className={styles.bookImg}
                    />
                  ) : (
                    <div className={styles.bookImgPlaceholder} />
                  )}
                </div>
                <p className={styles.bookTitle}>{book.title}</p>
                <p className={styles.bookAuthor}>{book.author}</p>
                <button
                  className={styles.removeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(book._id);
                  }}
                >
                  <Icon id="close" width={16} height={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedBook && (
        <Modal onClose={() => setSelectedBook(null)}>
          <div className={styles.modalContent}>
            {selectedBook.imageUrl ? (
              <img
                src={selectedBook.imageUrl}
                alt={selectedBook.title}
                className={styles.modalImg}
              />
            ) : (
              <div className={styles.modalImgPlaceholder} />
            )}
            <h3 className={styles.modalTitle}>{selectedBook.title}</h3>
            <p className={styles.modalAuthor}>{selectedBook.author}</p>
            <p className={styles.modalPages}>{selectedBook.totalPages} pages</p>
            <button
              className={styles.startBtn}
              onClick={() => navigate(`/reading/${selectedBook._id}`)}
            >
              Start reading
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LibraryPage;
