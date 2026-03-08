import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRecommended,
  addToLibrary,
  fetchLibrary,
} from "../../redux/books/booksOperations";
import {
  selectRecommended,
  selectTotalPages,
  selectCurrentPage,
  setPage,
} from "../../redux/books/booksSlice";
import Icon from "../../components/Icon/Icon";
import Modal from "../../components/Modal/Modal";
import styles from "./RecommendedPage.module.css";
import toast from "react-hot-toast";
import booksImg from "../../assets/images/books/books.png";

const getLimit = () => {
  const w = window.innerWidth;
  if (w >= 1440) return 10;
  if (w >= 768) return 8;
  return 5;
};

const RecommendedPage = () => {
  const dispatch = useDispatch();
  const books = useSelector(selectRecommended);
  const totalPages = useSelector(selectTotalPages);
  const currentPage = useSelector(selectCurrentPage);
  const [selectedBook, setSelectedBook] = useState(null);
  const [filters, setFilters] = useState({ title: "", author: "" });

  useEffect(() => {
    dispatch(
      fetchRecommended({ page: currentPage, limit: getLimit(), ...filters }),
    );
  }, [dispatch, currentPage, filters]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    setFilters({ title: form.title.value, author: form.author.value });
    dispatch(setPage(1));
  };

  const handleAddToLibrary = async (book) => {
    const result = await dispatch(addToLibrary(book));
    if (addToLibrary.rejected.match(result)) {
      toast.error(result.payload);
    } else {
      toast.success("Book added to library!");
      dispatch(fetchLibrary());
      setSelectedBook(null);
    }
  };

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.filters}>
          <p className={styles.filterTitle}>Filters:</p>
          <form onSubmit={handleFilterSubmit} className={styles.filterForm}>
            <div className={styles.inputWrap}>
              <label className={styles.label}>Book title:</label>
              <input
                name="title"
                className={styles.input}
                placeholder="Enter text"
              />
            </div>
            <div className={styles.inputWrap}>
              <label className={styles.label}>The author:</label>
              <input
                name="author"
                className={styles.input}
                placeholder="Enter text"
              />
            </div>
            <button type="submit" className={styles.applyBtn}>
              To apply
            </button>
          </form>
        </div>

        <div className={styles.infoBlock}>
          <p className={styles.infoText}>Start your workout</p>
          <ol className={styles.infoList}>
            <li>
              <span className={styles.infoNum}>1</span>
              <p>
                <strong>Create a personal library:</strong>{" "}
                <span className={styles.infoGrey}>
                  add the books you intend to read to it.
                </span>
              </p>
            </li>
            <li>
              <span className={styles.infoNum}>2</span>
              <p>
                <strong>Create your first workout:</strong>{" "}
                <span className={styles.infoGrey}>
                  define a goal, choose a period, start training.
                </span>
              </p>
            </li>
          </ol>
          <a href="/library" className={styles.libraryLink}>
            My library <Icon id="arrow" width={24} height={24} />
          </a>
        </div>

        <div className={styles.quoteBlock}>
          <img src={booksImg} alt="books" className={styles.quoteImg} />
          <p className={styles.quoteText}>
            "Books are <strong>windows</strong> to the world, and reading is a
            journey into the unknown."
          </p>
        </div>
      </aside>

      <section className={styles.content}>
        <div className={styles.contentHeader}>
          <h2 className={styles.contentTitle}>Recommended</h2>
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => dispatch(setPage(currentPage - 1))}
              disabled={currentPage === 1}
            >
              <Icon
                id="arrow"
                width={24}
                height={24}
                className={styles.arrowLeft}
              />
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => dispatch(setPage(currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <Icon id="arrow" width={24} height={24} />
            </button>
          </div>
        </div>

        <ul className={styles.bookList}>
          {books.map((book) => (
            <li
              key={book._id}
              className={styles.bookCard}
              onClick={() => setSelectedBook(book)}
            >
              <div className={styles.bookImgWrap}>
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className={styles.bookImg}
                />
              </div>
              <p className={styles.bookTitle}>{book.title}</p>
              <p className={styles.bookAuthor}>{book.author}</p>
            </li>
          ))}
        </ul>
      </section>

      {selectedBook && (
        <Modal onClose={() => setSelectedBook(null)}>
          <div className={styles.modalContent}>
            <img
              src={selectedBook.imageUrl}
              alt={selectedBook.title}
              className={styles.modalImg}
            />
            <h3 className={styles.modalTitle}>{selectedBook.title}</h3>
            <p className={styles.modalAuthor}>{selectedBook.author}</p>
            <p className={styles.modalPages}>{selectedBook.totalPages} pages</p>
            <button
              className={styles.addBtn}
              onClick={() => handleAddToLibrary(selectedBook)}
            >
              Add to library
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RecommendedPage;
