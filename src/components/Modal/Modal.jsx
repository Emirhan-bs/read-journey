import { useEffect } from 'react';
import Icon from '../Icon/Icon';
import styles from './Modal.module.css';

const Modal = ({ onClose, children }) => {
  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <Icon id="close" width={24} height={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;