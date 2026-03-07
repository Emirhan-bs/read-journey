import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchLibrary } from "../../redux/books/booksOperations";
import { selectLibrary } from "../../redux/books/booksSlice";
import Icon from "../../components/Icon/Icon";
import Modal from "../../components/Modal/Modal";
import styles from "./ReadingPage.module.css";
import toast from "react-hot-toast";
import api from "../../services/api";

const ReadingPage = () => {
  const { bookId } = useParams();
  const dispatch = useDispatch();
  const library = useSelector(selectLibrary);

  const [page, setPage] = useState("");
  const [activeTab, setActiveTab] = useState("diary");
  const [showDoneModal, setShowDoneModal] = useState(false);

  const book = library.find((b) => b._id === bookId) || null;
  const progress = book?.progress || [];
  const isReading = progress.some((p) => !p.finishReading);

  useEffect(() => {
    dispatch(fetchLibrary());
  }, [dispatch]);

  const handleStart = async () => {
    if (!page) return toast.error("Enter page number");
    try {
      await api.post("/books/reading/start", {
        id: bookId,
        page: Number(page),
      });
      toast.success("Reading started!");
      dispatch(fetchLibrary());
    } catch (e) {
      toast.error(e.response?.data?.message || "Error");
    }
  };

  const handleStop = async () => {
    if (!page) return toast.error("Enter page number");
    try {
      await api.post("/books/reading/finish", {
        id: bookId,
        page: Number(page),
      });
      setPage("");
      toast.success("Reading stopped!");
      dispatch(fetchLibrary());
      if (book && Number(page) >= book.totalPages) setShowDoneModal(true);
    } catch (e) {
      toast.error(e.response?.data?.message || "Error");
    }
  };

  const handleDeleteProgress = async (readingId) => {
    try {
      await api.delete(`/books/reading/delete/${readingId}`);
      dispatch(fetchLibrary());
    } catch (e) {
      toast.error(e.response?.data?.message || "Error");
    }
  };

  const totalRead = progress.reduce(
    (acc, p) => acc + ((p.finishPage || 0) - (p.startPage || 0)),
    0,
  );
  const totalPages = book?.totalPages || 1;
  const percent = Math.min(Math.round((totalRead / totalPages) * 100), 100);

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.readingForm}>
          <p className={styles.sideTitle}>
            {isReading ? "Stop page:" : "Start page:"}
          </p>
          <div className={styles.inputWrap}>
            <label className={styles.label}>Page number:</label>
            <input
              type="number"
              min="1"
              className={styles.input}
              placeholder="0"
              value={page}
              onChange={(e) => setPage(e.target.value)}
            />
          </div>
          <button
            className={styles.actionBtn}
            onClick={isReading ? handleStop : handleStart}
          >
            {isReading ? "To stop" : "To start"}
          </button>
        </div>

        <div className={styles.detailsBlock}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "diary" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("diary")}
            >
              <Icon id="hourglass" width={20} height={20} />
            </button>
            <button
              className={`${styles.tab} ${activeTab === "stats" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("stats")}
            >
              <Icon id="pie-chart" width={20} height={20} />
            </button>
          </div>

          {activeTab === "diary" && (
            <ul className={styles.diary}>
              {progress.length === 0 ? (
                <li className={styles.emptyDiary}>No reading sessions yet.</li>
              ) : (
                progress.map((entry, i) => (
                  <li key={i} className={styles.diaryEntry}>
                    <div className={styles.diaryTop}>
                      <span className={styles.diaryDate}>
                        {new Date(entry.startReading).toLocaleDateString()}
                      </span>
                      <span className={styles.diaryPages}>
                        {(entry.finishPage || 0) - (entry.startPage || 0)} pages
                      </span>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteProgress(entry._id)}
                      >
                        <Icon id="close" width={16} height={16} />
                      </button>
                    </div>
                    <div className={styles.diaryPercent}>
                      {Math.round(
                        ((entry.finishPage - entry.startPage) / totalPages) *
                          100,
                      )}
                      %
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}

          {activeTab === "stats" && (
            <div className={styles.stats}>
              <div className={styles.circleWrap}>
                <svg viewBox="0 0 120 120" className={styles.circle}>
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#262626"
                    strokeWidth="12"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#30b94d"
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - percent / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <span className={styles.circleText}>{percent}%</span>
              </div>
              <p className={styles.statsLabel}>
                <span className={styles.statsGreen}>●</span> {percent}% read
              </p>
            </div>
          )}
        </div>
      </aside>

      <section className={styles.content}>
        <h2 className={styles.contentTitle}>My reading</h2>
        {book && (
          <div className={styles.bookWrap}>
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
              className={`${styles.recordBtn} ${isReading ? styles.recordActive : ""}`}
            >
              <Icon id="error" width={24} height={24} />
            </button>
          </div>
        )}
      </section>

      {showDoneModal && (
        <Modal onClose={() => setShowDoneModal(false)}>
          <div className={styles.doneModal}>
            <div className={styles.doneEmoji}>📚</div>
            <h3 className={styles.doneTitle}>The book is read</h3>
            <p className={styles.doneText}>
              It was an exciting journey, where each page revealed new horizons.
            </p>
            <div className={styles.circleWrap}>
              <svg viewBox="0 0 120 120" className={styles.circle}>
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#262626"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#30b94d"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <span className={styles.circleText}>100%</span>
            </div>
            <p className={styles.statsLabel}>
              <span className={styles.statsGreen}>●</span> 100% read
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReadingPage;
