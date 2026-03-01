import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { refreshUser } from './redux/auth/authOperations';
import useAuth from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RecommendedPage from './pages/RecommendedPage/RecommendedPage';
import LibraryPage from './pages/LibraryPage/LibraryPage';
import ReadingPage from './pages/ReadingPage/ReadingPage';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return !isLoggedIn ? children : <Navigate to="/recommended" />;
};

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) dispatch(refreshUser());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/recommended" element={<PrivateRoute><Layout><RecommendedPage /></Layout></PrivateRoute>} />
      <Route path="/library" element={<PrivateRoute><Layout><LibraryPage /></Layout></PrivateRoute>} />
      <Route path="/reading/:bookId" element={<PrivateRoute><Layout><ReadingPage /></Layout></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/recommended" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;