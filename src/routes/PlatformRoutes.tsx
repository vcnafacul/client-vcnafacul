import { Route, Routes } from "react-router-dom";

import Home from "../pages/home";
import Login from "../pages/login";
import { DASHBOARD, DASHBOARD_GEOLOCATION, DASH_SIMULADO, HOME_PATH, LOGIN_PATH, REGISTER_PATH, SIMULADO } from "./path";
import Dash from "../pages/dash";
import DashGeo from "../pages/dashGeo";
import Register from "../pages/register";
import DashSimulate from "../pages/dashSimulate";
import Simulate from "../pages/simulate";


export function PlatformRoutes() {

    return (
        <Routes>
            <Route path={HOME_PATH} element={<Home />} />
            <Route path={LOGIN_PATH} element={<Login />} />
            <Route path={REGISTER_PATH} element={<Register />} />
            <Route path={DASHBOARD} element={<Dash />} />
            <Route path={DASHBOARD_GEOLOCATION} element={<DashGeo />} />
            <Route path={DASH_SIMULADO} element={<DashSimulate />} />
            <Route path={SIMULADO} element={<Simulate />} />
        </Routes>
    );
}
