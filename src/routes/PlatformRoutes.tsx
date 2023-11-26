import { Route, Routes } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import { HOME_PATH, LOGIN_PATH } from "./path";


export function PlatformRoutes() {

    return (
        <Routes>
            <Route path={HOME_PATH} element={<Home />} />
            <Route path={LOGIN_PATH} element={<Login />} />
        </Routes>
    );
}
