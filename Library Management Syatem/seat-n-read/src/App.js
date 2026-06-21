import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookSeat from "./pages/BookSeat";
import RequestBook from "./pages/RequestBook";
import AdminDashboard from "./pages/AdminDashboard";

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <div className="container" style={{ marginTop: '80px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/book-seat" element={
            <ProtectedRoute><BookSeat /></ProtectedRoute>
          } />
          <Route path="/request-book" element={
            <ProtectedRoute><RequestBook /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>
          } />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer theme="dark" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;