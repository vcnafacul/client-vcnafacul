import React from "react";
import { Navigate } from "react-router-dom";
import { DASH } from "./path";

interface ProtectedRoutePermissionProps {
    permission: boolean;
    children: React.ReactNode;
}

function ProtectedRoutePermission({ permission, children } : ProtectedRoutePermissionProps) {
    if (!permission) {
      return <Navigate to={DASH} replace />;
    }
  
    return children;
  }
export default ProtectedRoutePermission