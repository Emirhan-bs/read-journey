import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { login } from '../../redux/auth/authOperations';
import { useState } from 'react';
import Icon from '../../components/Icon/Icon';
import styles from './LoginPage.module.css';
import toast from 'react-hot-toast';

const schema = yup.object({
  email: yup.string().matches(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, 'Invalid email').required('Email is required'),
  password: yup.string().min(7, 'Minimum 7 characters').required('Password is required'),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, touchedFields } } = useForm({
    resolver: yupResolver(schema), mode: 'onChange',
  });

  const onSubmit = async (data) => {
    const result = await dispatch(login(data));
    if (login.rejected.match(result)) toast.error(result.payload);
  };

  return (
    <div className={styles.page}>
      <div className={styles.formSide}>
        <Link to="/" className={styles.logo}>
          <Icon id="main-logo" width={182} height={17} />
        </Link>
        <div className={styles.formWrap}>
          <h1 className={styles.title}>Expand your mind, <span>reading a book</span></h1>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.inputWrap}>
              <input className={`${styles.input} ${errors.email ? styles.inputError : touchedFields.email ? styles.inputSuccess : ''}`} placeholder="Email" {...register('email')} />
              {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
            </div>
            <div className={styles.inputWrap}>
              <div className={styles.passwordWrap}>
                <input className={`${styles.input} ${errors.password ? styles.inputError : touchedFields.password ? styles.inputSuccess : ''}`} type={showPassword ? 'text' : 'password'} placeholder="Password" {...register('password')} />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(p => !p)}>
                  <Icon id={showPassword ? 'eye' : 'vector'} width={20} height={20} />
                </button>
              </div>
              {errors.password ? <span className={styles.errorMsg}>{errors.password.message}</span> : touchedFields.password && <span className={styles.successMsg}>Password is secure</span>}
            </div>
            <div className={styles.bottomRow}>
              <button type="submit" className={styles.submitBtn}>Log In</button>
              <Link to="/register" className={styles.link}>Don't have an account?</Link>
            </div>
          </form>
        </div>
      </div>
      <div className={styles.imageSide}>
        <img src="/src/assets/images/iphone.svg" alt="app preview" />
      </div>
    </div>
  );
};

export default LoginPage;