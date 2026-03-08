import styles from "./Loader.module.css";

const Loader = () => {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner} />
    </div>
  );
};

export default Loader;
