import { DateTime } from "luxon";
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { jwtDecoded } from "../utils/jwt";
import { HOME_PATH } from "./path";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

function ProtectedRoute({ children, redirectTo }: ProtectedRouteProps) {
  const {
    data: { token },
    logout,
  } = useAuthStore();

  if (!token) {
    return <Navigate to={redirectTo || HOME_PATH} replace />;
  }
  const decoded = jwtDecoded(token);
  if (new Date(decoded.exp * 1000) < DateTime.now().toJSDate()) {
    logout();
    return <Navigate to={redirectTo || HOME_PATH} replace />;
  }
  return children;
}
export default ProtectedRoute;
