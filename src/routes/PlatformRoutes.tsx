import { ConfirmEnrolled } from "@/pages/confirmEnrolled";
import InviteMemberProcessing from "@/pages/inviteMemberProcessing";
import ManagerCollaborator from "@/pages/managerCollaborator";
import { PartnerClass } from "@/pages/partnerClass";
import { PartnerClassWithStudents } from "@/pages/partnerClassWithStudents";
import { PartnerPrepInscriptionManager } from "@/pages/partnerPrepInscriptionManager";
import { PartnerPrepInscritionStudentManager } from "@/pages/partnerPrepInscritionStudentManager";
import { Navigate, Route, Routes } from "react-router-dom";
import DashTemplate from "../components/templates/dashTemplate";
import { Roles } from "../enums/roles/roles";
import Geo from "../pages/Geo";
import Account from "../pages/account";
import { ConfirmEmailPage } from "../pages/confirmEmail";
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
import { PartnerPrepInscription } from "../pages/partnerPrepInscription";
import Register from "../pages/register";
import { Reset } from "../pages/reset";
import Simulate from "../pages/simulate";
import { SimulationHistories } from "../pages/simulationHistories";
import { SimulationHistory } from "../pages/simulationHistory";
import Subject from "../pages/subject";
import { useAuthStore } from "../store/auth";
import { BaseRoutes } from "./baseRoutes";
import { HeroRoutes } from "./heroRoutes";
import {
  ACCOUNT_PATH,
  CONFIRM_EMAIL,
  CONTENT,
  DASH,
  DASH_CONTENT,
  DASH_GEOLOCATION,
  DASH_NEWS,
  DASH_PROVAS,
  DASH_QUESTION,
  DASH_ROLES,
  DASH_SIMULADO,
  DECLARED_INTEREST,
  ESTUDO,
  FORGOT_PASSWORD_PATH,
  FORM_GEOLOCATION,
  HOME_PATH,
  INVITE_MEMBER,
  LOGIN_PATH,
  LOGOFF_PATH,
  MANAGER_COLLABORATOR,
  NEWS,
  PARTNER_CLASS,
  PARTNER_CLASS_STUDENTS,
  PARTNER_PREP,
  PARTNER_PREP_INSCRIPTION,
  REGISTER_PATH,
  RESET_PASSWORD_PATH,
  SIMULADO,
  SIMULADO_HISTORIES,
  SIMULADO_RESPONDER,
  SIMULATE_METRICS,
} from "./path";
import ProtectedRoute from "./protectedRoute";
import ProtectedRoutePermission from "./protectedRoutePermission";
import { StudentsEnrolled } from "@/pages/studentsEnrolled";

export function PlatformRoutes() {
  const { data } = useAuthStore();

  return (
    <Routes>
      {/* Aluno tem acesso */}
      <Route element={<ConfirmEmailPage />} path={CONFIRM_EMAIL} />
      <Route element={<BaseRoutes />}>
        <Route element={<HeroRoutes />}>
          <Route path={HOME_PATH} element={<Home />} />
          <Route path={NEWS} element={<NewsPage />} />
        </Route>

        <Route path={LOGIN_PATH} element={<Login />} />
        <Route path={FORGOT_PASSWORD_PATH} element={<Forgot />} />
        <Route path={LOGOFF_PATH} element={<Logout />} />
        <Route path={RESET_PASSWORD_PATH} element={<Reset />} />
        <Route path={REGISTER_PATH} element={<Register />} />
        <Route path={FORM_GEOLOCATION} element={<Geo />} />
        <Route path={INVITE_MEMBER} element={<InviteMemberProcessing />} />
        <Route path={DECLARED_INTEREST} element={<ConfirmEnrolled />} />
      </Route>

      <Route
        path={SIMULADO_RESPONDER}
        element={
          <ProtectedRoute>
            <Simulate />
          </ProtectedRoute>
        }
      />

      <Route path={PARTNER_PREP} element={<BaseRoutes />}>
        <Route
          path={`${PARTNER_PREP_INSCRIPTION}/:hashPrepCourse`}
          element={<PartnerPrepInscription />}
        />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashTemplate hasMenu />
          </ProtectedRoute>
        }
      >
        <Route
          path={PARTNER_PREP_INSCRIPTION}
          element={<PartnerPrepInscriptionManager />}
        />
        <Route path={MANAGER_COLLABORATOR} element={<ManagerCollaborator />} />
        <Route path={PARTNER_CLASS} element={<PartnerClass />} />
        <Route
          path={`${PARTNER_PREP_INSCRIPTION}/:inscriptionId`}
          element={<PartnerPrepInscritionStudentManager />}
        />
        <Route
          path={`${PARTNER_CLASS}/:hashPrepCourse`}
          element={<PartnerClassWithStudents />}
        />
        <Route
          path={PARTNER_CLASS_STUDENTS}
          element={<StudentsEnrolled />}
        />
        <Route path={DASH} element={<Dash />} />
        <Route path={SIMULADO} element={<MainSimulate />} />
        <Route path={SIMULADO_HISTORIES} element={<SimulationHistories />} />

        <Route
          path={`${SIMULADO}${SIMULATE_METRICS}:historicId`}
          element={<SimulationHistory />}
        />

        <Route path={`${ESTUDO}/:nomeMateria`} element={<Materia />} />
        <Route path={`${CONTENT}/:nameSubject/:id`} element={<Subject />} />
        <Route path={ACCOUNT_PATH} element={<Account />} />
        <Route
          path={DASH_QUESTION}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.visualizarQuestao]}
            >
              <DashQuestion />
            </ProtectedRoutePermission>
          }
        />
        <Route
          path={DASH_GEOLOCATION}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.validarCursinho]}
            >
              <DashGeo />
            </ProtectedRoutePermission>
          }
        />
        <Route
          path={DASH_ROLES}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.alterarPermissao]}
            >
              <DashRoles />
            </ProtectedRoutePermission>
          }
        />

        <Route
          path={DASH_NEWS}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.uploadNews]}
            >
              <DashNews />
            </ProtectedRoutePermission>
          }
        />

        <Route
          path={DASH_PROVAS}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.visualizarProvas]}
            >
              <DashProva />
            </ProtectedRoutePermission>
          }
        />

        <Route
          path={DASH_CONTENT}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.visualizarDemanda]}
            >
              <DashContent mtv={data.permissao[Roles.validarDemanda]} />
            </ProtectedRoutePermission>
          }
        />

        <Route
          path={DASH_SIMULADO}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.criarSimulado]}
            >
              <DashSimulado />
            </ProtectedRoutePermission>
          }
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to={data.token ? DASH : HOME_PATH} replace />}
      />
    </Routes>
  );
}
