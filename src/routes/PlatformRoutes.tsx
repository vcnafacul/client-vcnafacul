import { Route, Routes } from "react-router-dom";

import Home from "../pages/home";
import Login from "../pages/login";
import { DASHBOARD, DASHBOARD_GEOLOCATION, HOME_PATH, LOGIN_PATH } from "./path";
import Dash from "../pages/dash";
import DashGeo from "../pages/dashGeo";


export function PlatformRoutes() {

    return (
        <Routes>
            <Route path={HOME_PATH} element={<Home />} />
            <Route path={LOGIN_PATH} element={<Login />} />
            <Route path={DASHBOARD} element={<Dash />} />
            <Route path={DASHBOARD_GEOLOCATION} element={<DashGeo />} />
        </Routes>
    );
}
