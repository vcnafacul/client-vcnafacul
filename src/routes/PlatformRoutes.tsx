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
import { useAuthStore } from "../store/auth";
import ProtectedRoute from "./protectedRoute";
import { Roles } from "../enums/roles/roles";


export function PlatformRoutes() {

    const { data } = useAuthStore()

    return (
        <Routes>
            //Aluno tem acesso
            <Route path={HOME_PATH} element={<Home />} />
            <Route path={LOGIN_PATH} element={<Login />} />
            <Route path={LOGOFF_PATH} element={<Logout />} />
            <Route path={REGISTER_PATH} element={<Register />} />
            <Route path={DASH} element={<Dash />} />
            <Route path={DASH_SIMULADO} element={<DashSimulate />} />
            <Route path={SIMULADO} element={<Simulate />} />
            <Route path={NEWS} element={ <NewsPage />} />


            <Route path={DASH_GEOLOCATION} element={
                <ProtectedRoute permission={data.permissao[Roles.validarCursinho]}>
                    <DashGeo />
                </ProtectedRoute>} />

            <Route path={DASH_QUESTION} element={
                <ProtectedRoute permission={data.permissao[Roles.bancoQuestoes]}>
                    <DashQuestion />
                </ProtectedRoute>} />

            <Route path={DASH_NEWS} element={
                <ProtectedRoute permission={data.permissao[Roles.uploadNews]}>
                    <DashNews />
                </ProtectedRoute>} />

            <Route path="*" element={<Navigate to={data.token ? DASH : HOME_PATH} replace />} />
        </Routes>
    );
}
