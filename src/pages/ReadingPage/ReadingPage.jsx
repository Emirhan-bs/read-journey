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

const MiniBarChart = () => {
  const bars = [0.45, 0.65, 0.55, 0.8, 1.0];
  return (
    <svg width="44" height="24" viewBox="0 0 44 24" fill="none">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 10}
          y={24 - h * 22}
          width="7"
          height={h * 22}
          rx="1.5"
          fill="#30b94d"
        />
      ))}
    </svg>
  );
};

const ReadingPage = () => {
  const { bookId } = useParams();
  const dispatch = useDispatch();
  const library = useSelector(selectLibrary);

  const [page, setPage] = useState("");
  const [activeTab, setActiveTab] = useState("diary");
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());

  const book = library.find((b) => b._id === bookId) || null;
  const progress = book?.progress || [];
  const isReading = progress.some((p) => p.startReading && !p.finishReading);

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

  const handleDeleteProgress = async (entry) => {
    const readingId = entry._id;
    if (deletingIds.has(readingId)) return;

    if (entry.startReading && !entry.finishReading) {
      toast.error("Stop the active session before deleting it.");
      return;
    }

    setDeletingIds((prev) => new Set(prev).add(readingId));
    try {
      await api.delete(
        `/books/reading/delete?bookId=${bookId}&readingId=${readingId}`,
      );
      dispatch(fetchLibrary());
      toast.success("Session deleted");
    } catch (e) {
      toast.error(e.response?.data?.message || "Error deleting session");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(readingId);
        return next;
      });
    }
  };

  const totalPages = book?.totalPages || 1;
  const totalRead = progress
    .filter((p) => p.finishPage && p.startPage)
    .reduce((acc, p) => acc + (p.finishPage - p.startPage), 0);
  const percent = Math.min(Math.round((totalRead / totalPages) * 100), 100);
  const percentExact = Math.min((totalRead / totalPages) * 100, 100);

  const latestWithSpeed = [...progress].reverse().find((p) => p.speed > 0);
  const pagesLeft = totalPages - totalRead;
  const minutesLeft = latestWithSpeed
    ? Math.round((pagesLeft / latestWithSpeed.speed) * 60)
    : null;

  const formatTimeLeft = (min) => {
    if (!min || min <= 0) return null;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h} hours and ${m} minutes left` : `${m} minutes left`;
  };
  const timeLeft = formatTimeLeft(minutesLeft);

  const groupedByDate = progress.reduce((acc, entry) => {
    const key = new Date(entry.startReading).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

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
          <div className={styles.tabsRow}>
            <span className={styles.tabsLabel}>
              {progress.length === 0
                ? "Progress"
                : activeTab === "diary"
                  ? "Diary"
                  : "Statistics"}
            </span>
            {progress.length > 0 && (
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${activeTab === "diary" ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab("diary")}
                  title="Diary"
                >
                  <Icon id="hourglass" width={20} height={20} />
                </button>
                <button
                  className={`${styles.tab} ${activeTab === "stats" ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab("stats")}
                  title="Statistics"
                >
                  <Icon id="pie-chart" width={20} height={20} />
                </button>
              </div>
            )}
          </div>

          {progress.length === 0 && (
            <div className={styles.emptyProgress}>
              <p className={styles.emptyText}>
                Here you will see when and how much you read. To record, click
                on the red button above.
              </p>
              <div className={styles.starWrap}>
                <span className={styles.starEmoji}>⭐</span>
              </div>
            </div>
          )}

          {progress.length > 0 && activeTab === "diary" && (
            <ul className={styles.diary}>
              {Object.entries(groupedByDate).map(([dateKey, entries]) =>
                entries.map((entry, i) => {
                  const pagesRead =
                    (entry.finishPage || 0) - (entry.startPage || 0);
                  const entryPercent =
                    entry.finishPage && entry.startPage
                      ? ((pagesRead / totalPages) * 100).toFixed(1)
                      : 0;
                  const startTime = entry.startReading
                    ? new Date(entry.startReading)
                    : null;
                  const finishTime = entry.finishReading
                    ? new Date(entry.finishReading)
                    : null;
                  const durationMin =
                    startTime && finishTime
                      ? Math.round((finishTime - startTime) / 60000)
                      : null;
                  const speed = entry.speed || 0;
                  const isActive = !entry.finishReading;

                  return (
                    <li
                      key={entry._id || `${dateKey}-${i}`}
                      className={styles.diaryEntry}
                    >
                      <div className={styles.diaryTop}>
                        <span
                          className={`${styles.checkbox} ${isActive ? styles.checkboxActive : ""}`}
                        />
                        <span className={styles.diaryDate}>{dateKey}</span>
                        <span className={styles.diaryPageCount}>
                          {pagesRead} pages
                        </span>
                      </div>

                      <div className={styles.diaryStats}>
                        <div className={styles.diaryLeft}>
                          <span className={styles.diaryPercent}>
                            {entryPercent}%
                          </span>
                          {durationMin !== null && (
                            <span className={styles.diaryMinutes}>
                              {durationMin} minutes
                            </span>
                          )}
                        </div>
                        <div className={styles.diaryRight}>
                          {speed > 0 && (
                            <div className={styles.speedBlock}>
                              <MiniBarChart />
                              <span className={styles.speedText}>
                                {speed} pages
                                <br />
                                per hour
                              </span>
                            </div>
                          )}
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteProgress(entry)}
                            disabled={deletingIds.has(entry._id)}
                            title={
                              isActive ? "Stop reading first" : "Delete session"
                            }
                          >
                            <Icon id="trash" width={16} height={16} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                }),
              )}
            </ul>
          )}

          {progress.length > 0 && activeTab === "stats" && (
            <div className={styles.stats}>
              <p className={styles.statsDesc}>
                Each page, each chapter is a new round of knowledge, a new step
                towards understanding. By rewriting statistics, we create our
                own reading history.
              </p>
              <div className={styles.circleCard}>
                <div className={styles.circleWrap}>
                  <svg viewBox="0 0 120 120" className={styles.circle}>
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#1c1c1c"
                      strokeWidth="14"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#30b94d"
                      strokeWidth="14"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - percent / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <span className={styles.circleText}>{percent}%</span>
                </div>
                <div className={styles.statsLabelRow}>
                  <span className={styles.greenDot}>●</span>
                  <div>
                    <p className={styles.statsPercent}>
                      {percentExact.toFixed(2)}%
                    </p>
                    <p className={styles.statsPagesRead}>
                      {totalRead} pages read
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <section className={styles.content}>
        <div className={styles.contentHeader}>
          <h2 className={styles.contentTitle}>My reading</h2>
          {timeLeft && <span className={styles.timeLeft}>{timeLeft}</span>}
        </div>

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

            <div
              className={`${styles.recordRing} ${isReading ? styles.recordRingActive : ""}`}
            >
              <button
                className={styles.recordBtn}
                onClick={isReading ? handleStop : handleStart}
                title={isReading ? "Stop reading" : "Start reading"}
              >
                {isReading ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect
                      x="1"
                      y="1"
                      width="12"
                      height="12"
                      rx="2"
                      fill="#ffffff"
                    />
                  </svg>
                ) : (
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                    <path d="M1.5 1.5L12.5 8L1.5 14.5V1.5Z" fill="#ffffff" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Done modal ── */}
      {showDoneModal && (
        <Modal onClose={() => setShowDoneModal(false)}>
          <div className={styles.doneModal}>
            <div className={styles.doneEmoji}>📚</div>
            <h3 className={styles.doneTitle}>The book is read</h3>
            <p className={styles.doneText}>
              It was an{" "}
              <strong className={styles.doneHighlight}>exciting journey</strong>
              , where each page revealed new horizons, and the characters became
              inseparable friends.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReadingPage;
