import { Navigate, Route, Routes } from "react-router-dom";
import DashTemplate from "../components/templates/dashTemplate";
import { Roles } from "../enums/roles/roles";
import Geo from "../pages/Geo";
import Account from "../pages/account";
import Dash from "../pages/dash";
import DashContent from "../pages/dashContent";
import DashGeo from "../pages/dashGeo";
import DashNews from "../pages/dashNews";
import DashProva from "../pages/dashProvas";
import DashQuestion from "../pages/dashQuestion";
import DashRoles from "../pages/dashRoles";
import DashSimulado from "../pages/dashSimulado";
import Forgot from "../pages/forgot";
import Home from "../pages/home";
import Login from "../pages/login";
import Logout from "../pages/logout";
import MainSimulate from "../pages/mainSimulate";
import Materia from "../pages/materia";
import NewsPage from "../pages/newsPage";
import Register from "../pages/register";
import { Reset } from "../pages/reset";
import { SimulationHistory } from "../pages/simulationHistory";
import Simulate from "../pages/simulate";
import Subject from "../pages/subject";
import { useAuthStore } from "../store/auth";
import { BaseRoutes } from "./baseRoutes";
import { HeroRoutes } from "./heroRoutes";
import { ACCOUNT_PATH, CONFIRM_EMAIL, CONTENT, DASH, DASH_CONTENT, DASH_GEOLOCATION, DASH_NEWS, DASH_PROVAS, DASH_QUESTION, DASH_ROLES, DASH_SIMULADO, ESTUDO, FORGOT_PASSWORD_PATH, FORM_GEOLOCATION, HOME_PATH, LOGIN_PATH, LOGOFF_PATH, NEWS, PARTNER_PREP_INSCRIPTION, PARTNET_PREP, REGISTER_PATH, RESET_PASSWORD_PATH, SIMULADO, SIMULADO_HISTORIES, SIMULADO_RESPONDER, SIMULATE_METRICS } from "./path";
import ProtectedRoute from "./protectedRoute";
import ProtectedRoutePermission from "./protectedRoutePermission";
import { ConfirmEmailPage } from "../pages/confirmEmail";
import { SimulationHistories } from "../pages/simulationHistories";
import { PartnerPrepInscription } from "../pages/partnerPrepInscription";


export function PlatformRoutes() {

    const { data } = useAuthStore()

    return (
        <Routes>
            {/* Aluno tem acesso */}
            <Route element={<ConfirmEmailPage />} path={CONFIRM_EMAIL} />
            <Route element={<BaseRoutes />}>
                <Route element={<HeroRoutes />}>
                    <Route path={HOME_PATH} element={<Home />} />
                    <Route path={NEWS} element={ <NewsPage />} />
                </Route>

                <Route path={LOGIN_PATH} element={<Login />} />
                <Route path={FORGOT_PASSWORD_PATH} element={<Forgot />} />
                <Route path={LOGOFF_PATH} element={<Logout />} />
                <Route path={RESET_PASSWORD_PATH} element={<Reset />} />
                <Route path={REGISTER_PATH} element={<Register />} />
                <Route path={FORM_GEOLOCATION} element={<Geo />}/>
            </Route>
            
            <Route path={SIMULADO_RESPONDER} element={
                <ProtectedRoute>
                    <Simulate />
                </ProtectedRoute>
            } />

            <Route path={PARTNET_PREP} element={
                // <ProtectedRoute>
                    <BaseRoutes />
                //</ProtectedRoute>
            }>
                <Route path={PARTNER_PREP_INSCRIPTION} element={<PartnerPrepInscription />} />
            </Route>

            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <DashTemplate hasMenu />
                </ProtectedRoute>
            }>
                <Route path={DASH} element={<Dash />} />
                <Route path={SIMULADO} element={<MainSimulate />} />
                <Route path={SIMULADO_HISTORIES} element={<SimulationHistories />} />

                <Route path={`${SIMULADO}${SIMULATE_METRICS}:historicId`} element={<SimulationHistory /> } />

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
                    <ProtectedRoutePermission permission={data.permissao[Roles.visualizarProvas]}>
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