import queryString from "query-string";
import { Navigate, Outlet } from "react-router-dom";
import { DASH, LOGIN_PATH } from "./path";
import { useAuthStore } from "../store/auth";
import { jwtDecoded } from "../utils/jwt";
import { useLocation } from "react-router-dom";

function OnboardingRoute() {
  const { data } = useAuthStore();
  const location = useLocation();
  const tokenFromUrl = (queryString.parse(location.search).token as string) || "";

  if (tokenFromUrl) {
    try {
      const decoded = jwtDecoded(tokenFromUrl);
      if (decoded.profileComplete === false) {
        return <Outlet />;
      }
    } catch {
      // token inválido na URL
    }
  }

  if (data.token && data.profileComplete === false) {
    return <Outlet />;
  }

  if (data.token) {
    return <Navigate to={DASH} replace />;
  }

  return <Navigate to={LOGIN_PATH} replace />;
}

export default OnboardingRoute;
