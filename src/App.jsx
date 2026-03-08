import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { refreshUser } from "./redux/auth/authOperations";
import useAuth from "./hooks/useAuth";
import Layout from "./components/Layout/Layout";
import Loader from "./components/Loader/Loader";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RecommendedPage from "./pages/RecommendedPage/RecommendedPage";
import LibraryPage from "./pages/LibraryPage/LibraryPage";
import ReadingPage from "./pages/ReadingPage/ReadingPage";

const PrivateRoute = ({ children, isRefreshing }) => {
  const { isLoggedIn } = useAuth();
  if (isRefreshing) return null;
  return isLoggedIn ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children, isRefreshing }) => {
  const { isLoggedIn } = useAuth();
  if (isRefreshing) return null;
  return !isLoggedIn ? children : <Navigate to="/recommended" />;
};

const App = () => {
  const dispatch = useDispatch();

  const [isRefreshing, setIsRefreshing] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(refreshUser()).finally(() => setIsRefreshing(false));
    }
  }, [dispatch]);

  return (
    <>
      {isRefreshing && <Loader />}
      <Routes>
        <Route
          path="/register"
          element={
            <PublicRoute isRefreshing={isRefreshing}>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute isRefreshing={isRefreshing}>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/recommended"
          element={
            <PrivateRoute isRefreshing={isRefreshing}>
              <Layout>
                <RecommendedPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/library"
          element={
            <PrivateRoute isRefreshing={isRefreshing}>
              <Layout>
                <LibraryPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reading/:bookId"
          element={
            <PrivateRoute isRefreshing={isRefreshing}>
              <Layout>
                <ReadingPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/recommended" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

export default App;
