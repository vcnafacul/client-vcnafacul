import React from "react";
import { Navigate } from "react-router-dom";
import { HOME_PATH } from "./path";
import { useAuthStore } from "../store/auth";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

function ProtectedRoute({ children } : ProtectedRouteProps) {

  const { data: { token }} = useAuthStore()

    if (!token) {
      return <Navigate to={HOME_PATH} replace />;
    }
  
    return children;
  }
export default ProtectedRoute