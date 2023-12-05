import { Navigate, Route, Routes } from "react-router-dom";

import Home from "../pages/home";
import Login from "../pages/login";
import { DASH, DASH_GEOLOCATION, DASH_NEWS, DASH_QUESTION, DASH_SIMULADO, HOME_PATH, LOGIN_PATH, LOGOFF_PATH, NEWS, REGISTER_PATH, SIMULADO } from "./path";
import Dash from "../pages/dash";
import DashGeo from "../pages/dashGeo";
import Register from "../pages/register";
import DashSimulate from "../pages/dashSimulate";
import Simulate from "../pages/simulate";
import DashQuestion from "../pages/dashQuestion";
import Logout from "../pages/logout";
import DashNews from "../pages/dashNews";
import NewsPage from "../pages/newsPage";


export function PlatformRoutes() {

    return (
        <Routes>
            <Route path={HOME_PATH} element={<Home />} />
            <Route path={LOGIN_PATH} element={<Login />} />
            <Route path={LOGOFF_PATH} element={<Logout />} />
            <Route path={REGISTER_PATH} element={<Register />} />
            <Route path={NEWS} element={<NewsPage />} />
            <Route path={DASH} element={<Dash />} />
            <Route path={DASH_GEOLOCATION} element={<DashGeo />} />
            <Route path={DASH_SIMULADO} element={<DashSimulate />} />
            <Route path={SIMULADO} element={<Simulate />} />
            <Route path={DASH_QUESTION} element={<DashQuestion />} />
            <Route path={DASH_NEWS} element={<DashNews />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
