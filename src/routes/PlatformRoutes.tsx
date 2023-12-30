import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/home";
import Login from "../pages/login";
import { ACCOUNT_PATH, CONTENT, DASH, DASH_CONTENT, DASH_GEOLOCATION, DASH_NEWS, DASH_PROVAS, DASH_QUESTION, DASH_ROLES, DASH_SIMULADO, ESTUDO, HOME_PATH, LOGIN_PATH, LOGOFF_PATH, NEWS, REGISTER_PATH, SIMULADO, SIMULADO_RESPONDER } from "./path";
import Dash from "../pages/dash";
import DashGeo from "../pages/dashGeo";
import Register from "../pages/register";
import Simulate from "../pages/simulate";
import DashQuestion from "../pages/dashQuestion";
import Logout from "../pages/logout";
import DashNews from "../pages/dashNews";
import NewsPage from "../pages/newsPage";
import { useAuthStore } from "../store/auth";
import { Roles } from "../enums/roles/roles";
import DashTemplate from "../components/templates/dashTemplate";
import { headerDash } from "../pages/dash/data";
import DashRoles from "../pages/dashRoles";
import DashProva from "../pages/dashProvas";
import Account from "../pages/account";
import DashContent from "../pages/dashContent";
import ProtectedRoutePermission from "./protectedRoutePermission";
import ProtectedRoute from "./protectedRoute";
import MainSimulate from "../pages/mainSimulate";
import DashSimulado from "../pages/dashSimulado";
import Materia from "../pages/materia";
import Subject from "../pages/subject";


export function PlatformRoutes() {

    const { data } = useAuthStore()

    return (
        <Routes>
            //Aluno tem acesso
            <Route path={HOME_PATH} element={<Home />} />
            <Route path={LOGIN_PATH} element={<Login />} />
            <Route path={LOGOFF_PATH} element={<Logout />} />
            <Route path={REGISTER_PATH} element={<Register />} />
            <Route path={SIMULADO_RESPONDER} element={<Simulate />} />
            <Route path={NEWS} element={ <NewsPage />} />

            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <DashTemplate header={headerDash} hasMenu />
                </ProtectedRoute>
            }>
                <Route path={DASH} element={<Dash />} />
                <Route path={SIMULADO} element={<MainSimulate />} />
                <Route path={`${ESTUDO}/:nomeMateria`} element={ <Materia />} />
                <Route path={`${CONTENT}/:nameSubject/:id`} element={ <Subject />} />
                <Route path={ACCOUNT_PATH} element={ <Account />} />
                <Route path={DASH_QUESTION} element={
                    <ProtectedRoutePermission permission={data.permissao[Roles.visualizarQuestao]}>
                        <DashQuestion />
                    </ProtectedRoutePermission>} />
                <Route path={DASH_GEOLOCATION} element={
                    <ProtectedRoutePermission permission={data.permissao[Roles.validarCursinho]}>
                        <DashGeo />
                    </ProtectedRoutePermission>} />
                <Route path={DASH_ROLES} element={
                    <ProtectedRoutePermission permission={data.permissao[Roles.alterarPermissao]}>
                        <DashRoles />
                    </ProtectedRoutePermission>} />

                <Route path={DASH_NEWS} element={
                    <ProtectedRoutePermission permission={data.permissao[Roles.uploadNews]}>
                        <DashNews />
                    </ProtectedRoutePermission>} />

                <Route path={DASH_PROVAS} element={
                    <ProtectedRoutePermission permission={data.permissao[Roles.alterarPermissao]}>
                        <DashProva />
                    </ProtectedRoutePermission>} />

                <Route path={DASH_CONTENT} element={
                    <ProtectedRoutePermission permission={data.permissao[Roles.visualizarDemanda]}>
                        <DashContent mtv={data.permissao[Roles.validarDemanda]}/>
                    </ProtectedRoutePermission>} />

                <Route path={DASH_SIMULADO} element={
                    <ProtectedRoutePermission permission={data.permissao[Roles.criarSimulado]}>
                        <DashSimulado />
                    </ProtectedRoutePermission>} />
            </Route>

            <Route path="*" element={<Navigate to={data.token ? DASH : HOME_PATH} replace />} />
        </Routes>
    );
}
