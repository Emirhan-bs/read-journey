import Header from '../Header/Header';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.body}>
        {children}
      </div>
    </div>
  );
};

export default Layout;