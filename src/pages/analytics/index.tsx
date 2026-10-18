import StatCard from "@/components/atoms/statCard";
import { Period } from "@/enums/analytics/period";
import {
  ContentSummaryResponse,
  getContentSummaryStats,
} from "@/services/analytics/content/summary";
import {
  GeolocationSummary,
  geolocationSummary,
} from "@/services/analytics/geolocation/summary-status";
import {
  QuestionSummary,
  questionSummary,
} from "@/services/analytics/questoes/summary";
import {
  getHistoricoSummary,
  HistoricoSummaryResponse,
} from "@/services/analytics/simulado/historicoSummary";
import {
  getStudentsServed,
  StudentsServedResponse,
  getStudentsCurrentlyEnrolled,
  StudentsEnrolledResponse,
} from "@/services/dashboard";
import {
  getPartnerPrepCourseLogos,
  PartnerPrepCourseLogo,
} from "@/services/prepCourse/partnerLogos";
import { useAuthStore } from "@/store/auth";
import Grid from "@mui/material/Grid2";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { CabecalhoDoMonitoramento } from "./CabecalhoDoMonitoramento";
import { cursinhoDaUrl } from "./recorte";
import AnalyticsContent from "./content";
import AnalyticsGeolocation from "./geolocation";
import AnalyticsQuestion from "./question";
import AnalyticsSimulado from "./simulado";
import AnalyticsUsers from "./users";
import AnalyticsPrepCourse from "./prepCourse";

function Analytics() {
  const [period, setPeriod] = useState<Period>(Period.month);
  const {
    data: { token },
  } = useAuthStore();

  // tickets/044, card 06 — o cursinho do recorte mora na URL (D8).
  const [params, setParams] = useSearchParams();
  const [cursinhos, setCursinhos] = useState<PartnerPrepCourseLogo[]>([]);
  const [carregandoCursinhos, setCarregandoCursinhos] = useState(true);
  useEffect(() => {
    getPartnerPrepCourseLogos()
      .then(setCursinhos)
      .catch(() => toast.error("Não foi possível carregar os cursinhos"))
      .finally(() => setCarregandoCursinhos(false));
  }, []);
  const cursinho = useMemo(
    () => cursinhoDaUrl(params.get("cursinho"), cursinhos),
    [params, cursinhos],
  );
  const cursinhoId = cursinho?.id;
  // id que não está na lista (cursinho apagado, link velho) → "Todos"
  useEffect(() => {
    if (!carregandoCursinhos && params.get("cursinho") && !cursinho) {
      const proximos = new URLSearchParams(params);
      proximos.delete("cursinho");
      setParams(proximos, { replace: true });
    }
  }, [carregandoCursinhos, cursinho, params, setParams]);
  const escolherCursinho = (id: string | null) => {
    const proximos = new URLSearchParams(params);
    if (id) proximos.set("cursinho", id);
    else proximos.delete("cursinho");
    setParams(proximos);
  };

  const [kpiLoading, setKpiLoading] = useState(true);
  const [geoSummary, setGeoSummary] = useState<GeolocationSummary | null>(null);
  const [contentSummary, setContentSummary] =
    useState<ContentSummaryResponse | null>(null);
  const [questionSummaryData, setQuestionSummaryData] =
    useState<QuestionSummary | null>(null);
  const [historicoSummaryData, setHistoricoSummaryData] =
    useState<HistoricoSummaryResponse | null>(null);
  const [studentsServedData, setStudentsServedData] =
    useState<StudentsServedResponse | null>(null);
  const [studentsEnrolledData, setStudentsEnrolledData] =
    useState<StudentsEnrolledResponse | null>(null);

  useEffect(() => {
    setKpiLoading(true);
    Promise.all([
      geolocationSummary(token),
      getContentSummaryStats(token),
      questionSummary(token),
      getHistoricoSummary(token),
      getStudentsServed(token).catch(() => null),
      getStudentsCurrentlyEnrolled(token).catch(() => null),
    ])
      .then(([geo, content, question, historico, studentsServed, studentsEnrolled]) => {
        setGeoSummary(geo);
        setContentSummary(content);
        setQuestionSummaryData(question);
        setHistoricoSummaryData(historico);
        setStudentsServedData(studentsServed);
        setStudentsEnrolledData(studentsEnrolled);
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        setKpiLoading(false);
      });
  }, [token]);

  return (
    <div>
      <CabecalhoDoMonitoramento
        period={period}
        onPeriod={setPeriod}
        cursinhos={cursinhos}
        cursinho={cursinho}
        onCursinho={escolherCursinho}
        carregandoCursinhos={carregandoCursinhos}
      />

      {/* KPI Bar */}
      <div className="px-4 pb-2">
        <Grid container spacing={2}>
          {!cursinhoId && (
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatCard
                label="Total Cursinhos"
                value={geoSummary?.totalCourses ?? 0}
                color="marine"
                loading={kpiLoading}
              />
            </Grid>
          )}
          {!cursinhoId && (
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatCard
                label="Conteúdos Aprovados"
                value={contentSummary?.contentApproved ?? 0}
                color="green"
                loading={kpiLoading}
              />
            </Grid>
          )}
          {!cursinhoId && (
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatCard
                label="Conteúdos Pendentes"
                value={contentSummary?.contentPending ?? 0}
                color="orange"
                loading={kpiLoading}
              />
            </Grid>
          )}
          {!cursinhoId && (
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatCard
                label="Questões Total"
                value={questionSummaryData?.questionTotal ?? 0}
                color="marine"
                loading={kpiLoading}
              />
            </Grid>
          )}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              label="Simulados Completos"
              value={historicoSummaryData?.historicCompleted ?? 0}
              color="green"
              loading={kpiLoading}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              label="Simulados Total"
              value={historicoSummaryData?.historicTotal ?? 0}
              color="marine"
              loading={kpiLoading}
            />
          </Grid>
          {studentsServedData !== null && (
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatCard
                label="Estudantes Atendidos"
                value={studentsServedData?.total ?? 0}
                color="green"
                loading={kpiLoading}
              />
            </Grid>
          )}
          {studentsEnrolledData !== null && (
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatCard
                label="Estudantes Ativos"
                value={studentsEnrolledData?.total ?? 0}
                color="marine"
                loading={kpiLoading}
              />
            </Grid>
          )}
        </Grid>
      </div>

      <AnalyticsUsers period={period} cursinhoId={cursinhoId} />
      {!cursinhoId && <AnalyticsGeolocation />}
      {!cursinhoId && <AnalyticsContent />}
      {!cursinhoId && <AnalyticsQuestion />}
      <AnalyticsSimulado period={period} cursinhoId={cursinhoId} />
      <AnalyticsPrepCourse period={period} cursinhoId={cursinhoId} />
    </div>
  );
}

export default Analytics;
