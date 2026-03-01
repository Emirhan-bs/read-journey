import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { logout } from '../../redux/auth/authOperations';
import useAuth from '../../hooks/useAuth';
import Icon from '../Icon/Icon';
import styles from './Header.module.css';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <NavLink to="/recommended" className={styles.logo}>
          <Icon id="main-logo" width={182} height={17} className={styles.logoDesktop} />
          <Icon id="mobil-logo" width={42} height={17} className={styles.logoMobile} />
        </NavLink>

        <nav className={styles.nav}>
          <NavLink to="/recommended" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>Home</NavLink>
          <NavLink to="/library" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>My library</NavLink>
        </nav>

        <div className={styles.right}>
          <div className={styles.userBar}>
            <div className={styles.userAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <span className={styles.userName}>{user?.name}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} type="button">Log out</button>
          <button className={styles.burgerBtn} onClick={() => setMenuOpen(p => !p)} type="button">
            {menuOpen ? <Icon id="close" width={28} height={28} /> : <Icon id="hamburger-menu" width={28} height={28} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.backdrop} onClick={() => setMenuOpen(false)}>
          <div className={styles.mobileMenu} onClick={e => e.stopPropagation()}>
            <NavLink to="/recommended" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/library" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>My library</NavLink>
            <button className={styles.logoutBtn} onClick={handleLogout}>Log out</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;