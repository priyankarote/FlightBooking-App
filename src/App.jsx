import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import ConfirmationPage from "./pages/ConfirmationPage.jsx";
import FlightSearchPage from "./pages/FlightSearchPage.jsx";
import MyBookingsPage from "./pages/MyBookingsPage.jsx";

export default function App() {
  const { user } = useApp();
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage signup />} />
        <Route path="/" element={<ProtectedRoute><FlightSearchPage /></ProtectedRoute>} />
        <Route path="/book/:id" element={<ProtectedRoute role="user"><BookingPage /></ProtectedRoute>} />
        <Route path="/confirmation/:id" element={<ProtectedRoute role="user"><ConfirmationPage /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute role="user"><MyBookingsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={user ? (user.role === "admin" ? "/admin" : "/") : "/login"} replace />} />
      </Routes>
      <Footer />
    </>
  );
}
