import React from "react";
import { Navigate } from "react-router-dom";
import { DASH } from "./path";

interface RouterLock {
    permission: boolean;
    children: React.ReactNode;
}

function ProtectedRoute({ permission, children } : RouterLock) {
    if (!permission) {
      return <Navigate to={DASH} replace />;
    }
  
    return children;
  }
export default ProtectedRoute