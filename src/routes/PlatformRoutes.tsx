import Analytics from "@/pages/analytics";
import { ConfirmEnrolled } from "@/pages/confirmEnrolled";
import EnrollmentConfirmation from "@/pages/enrollmentConfirmation";
import InviteMemberProcessing from "@/pages/inviteMemberProcessing";
import ManagerCollaborator from "@/pages/managerCollaborator";
import { PartnerClass } from "@/pages/partnerClass";
import { PartnerClassWithStudents } from "@/pages/partnerClassWithStudents";
import PartnerPrepForm from "@/pages/partnerPrepForm";
import { PartnerPrepInscriptionManager } from "@/pages/partnerPrepInscriptionManager";
import { PartnerPrepInscritionStudentManager } from "@/pages/partnerPrepInscritionStudentManager";
import PartnerPrepManager from "@/pages/partnerPrepManager";
import RegistrationMonitor from "@/pages/registrationMonitor";
import { StudentsEnrolled } from "@/pages/studentsEnrolled";
import GlobalFormPage from "@/pages/globalForm";
import EssayWrite from "../pages/essayWrite";
import EssayResult from "../pages/essayResult";
import EssayHistory from "../pages/essayHistory";
import EssayThemeAdmin from "../pages/essayThemeAdmin";
import EssayReviewList from "../pages/essayReviewList";
import EssayReviewDetail from "../pages/essayReviewDetail";
import EssayViewDetail from "../pages/essayViewDetail";
import ReviewSingle from "../pages/essayViewDetail/ReviewSingle";
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
import DashQuestionNew from "../pages/dashQuestionNew";
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
  DASH_ANALYTICS,
  DASH_CONTENT,
  DASH_GEOLOCATION,
  DASH_GLOBAL_FORM,
  DASH_NEWS,
  DASH_PROVAS,
  DASH_QUESTION,
  DASH_ROLES,
  DASH_SIMULADO,
  DECLARED_INTEREST,
  ENROLLMENT_CONFIRMATION,
  ESSAY_WRITE,
  ESSAY_HISTORY,
  ESSAY_THEME_ADMIN,
  ESSAY_REVIEW_CURSINHO,
  ESSAY_REVIEW_LIST,
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
  PARTNER_CLASS_FORM,
  PARTNER_CLASS_STUDENTS,
  PARTNER_PREP,
  PARTNER_PREP_INSCRIPTION,
  PARTNER_PREP_MANAGER,
  REGISTER_PATH,
  REGISTRATION_MONITOR,
  RESET_PASSWORD_PATH,
  SIMULADO,
  SIMULADO_HISTORIES,
  SIMULADO_RESPONDER,
  SIMULATE_METRICS,
} from "./path";
import ProtectedRoute from "./protectedRoute";
import ProtectedRoutePermission from "./protectedRoutePermission";

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
        <Route
          path={`${DECLARED_INTEREST}/:inscriptionId`}
          element={<ConfirmEnrolled />}
        />
        <Route
          path={ENROLLMENT_CONFIRMATION}
          element={<EnrollmentConfirmation />}
        />
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
          path={`${PARTNER_PREP_INSCRIPTION}/:hashInscriptionId`}
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
          path={REGISTRATION_MONITOR}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.visualizarMinhasInscricoes]}
            >
              <RegistrationMonitor />
            </ProtectedRoutePermission>
          }
        />
        <Route
          path={PARTNER_CLASS_FORM}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.gerenciarProcessoSeletivo]}
            >
              <PartnerPrepForm />
            </ProtectedRoutePermission>
          }
        />
        <Route
          path={DASH_GLOBAL_FORM}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.gerenciarFormularioGlobal]}
            >
              <GlobalFormPage />
            </ProtectedRoutePermission>
          }
        />
        <Route path={DASH_ANALYTICS} element={<Analytics />} />
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
          path={`${PARTNER_CLASS}/:hashClassId`}
          element={<PartnerClassWithStudents />}
        />
        <Route path={PARTNER_CLASS_STUDENTS} element={<StudentsEnrolled />} />
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
              <DashQuestionNew />
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
              <DashContent />
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
        <Route
          path={PARTNER_PREP_MANAGER}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.alterarPermissao]}
            >
              <PartnerPrepManager />
            </ProtectedRoutePermission>
          }
        />
        <Route path={ESSAY_WRITE} element={<EssayWrite />} />
        <Route path={`${ESSAY_WRITE}/:id`} element={<EssayResult />} />
        <Route path={ESSAY_HISTORY} element={<EssayHistory />} />
        <Route
          path={ESSAY_THEME_ADMIN}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.gerenciarTemas]}
            >
              <EssayThemeAdmin />
            </ProtectedRoutePermission>
          }
        />
        <Route
          path={ESSAY_REVIEW_LIST}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.revisarTodasRedacoes]}
            >
              <EssayReviewList mode="admin" />
            </ProtectedRoutePermission>
          }
        />
        <Route
          path={`${ESSAY_REVIEW_LIST}/:id`}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.revisarTodasRedacoes]}
            >
              <EssayReviewDetail />
            </ProtectedRoutePermission>
          }
        />
        <Route
          path={`${ESSAY_REVIEW_LIST}/:id/ver`}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.revisarTodasRedacoes]}
            >
              <EssayViewDetail />
            </ProtectedRoutePermission>
          }
        />
        <Route
          path={`${ESSAY_REVIEW_LIST}/:id/ver/:reviewId`}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.revisarTodasRedacoes]}
            >
              <ReviewSingle />
            </ProtectedRoutePermission>
          }
        />
        <Route
          path={ESSAY_REVIEW_CURSINHO}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.revisarRedacoes]}
            >
              <EssayReviewList mode="cursinho" />
            </ProtectedRoutePermission>
          }
        />
        <Route
          path={`${ESSAY_REVIEW_CURSINHO}/:id`}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.revisarRedacoes]}
            >
              <EssayReviewDetail />
            </ProtectedRoutePermission>
          }
        />
        <Route
          path={`${ESSAY_REVIEW_CURSINHO}/:id/ver`}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.revisarRedacoes]}
            >
              <EssayViewDetail />
            </ProtectedRoutePermission>
          }
        />
        <Route
          path={`${ESSAY_REVIEW_CURSINHO}/:id/ver/:reviewId`}
          element={
            <ProtectedRoutePermission
              permission={data.permissao[Roles.revisarRedacoes]}
            >
              <ReviewSingle />
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
