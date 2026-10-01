import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../AppContext.jsx";

export default function ProtectedRoute({ children, role }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
