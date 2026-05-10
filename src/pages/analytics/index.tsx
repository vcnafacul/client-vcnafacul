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
} from "@/services/dashboard";
import { useAuthStore } from "@/store/auth";
import { Box, MenuItem, Select, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AnalyticsContent from "./content";
import AnalyticsGeolocation from "./geolocation";
import AnalyticsQuestion from "./question";
import AnalyticsSimulado from "./simulado";
import AnalyticsUsers from "./users";

function Analytics() {
  const [period, setPeriod] = useState<Period>(Period.month);
  const {
    data: { token },
  } = useAuthStore();

  const [kpiLoading, setKpiLoading] = useState(true);
  const [geoSummary, setGeoSummary] = useState<GeolocationSummary | null>(
    null
  );
  const [contentSummary, setContentSummary] =
    useState<ContentSummaryResponse | null>(null);
  const [questionSummaryData, setQuestionSummaryData] =
    useState<QuestionSummary | null>(null);
  const [historicoSummaryData, setHistoricoSummaryData] =
    useState<HistoricoSummaryResponse | null>(null);
  const [studentsServedData, setStudentsServedData] =
    useState<StudentsServedResponse | null>(null);

  useEffect(() => {
    setKpiLoading(true);
    Promise.all([
      geolocationSummary(token),
      getContentSummaryStats(token),
      questionSummary(token),
      getHistoricoSummary(token),
      getStudentsServed(token).catch(() => null),
    ])
      .then(([geo, content, question, historico, studentsServed]) => {
        setGeoSummary(geo);
        setContentSummary(content);
        setQuestionSummaryData(question);
        setHistoricoSummaryData(historico);
        setStudentsServedData(studentsServed);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3">
        <Typography variant="h4" fontWeight="bold" className="text-marine">
          Monitoramento de Atividades
        </Typography>
        <Box>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value={Period.day}>Diário</MenuItem>
            <MenuItem value={Period.month}>Mensal</MenuItem>
            <MenuItem value={Period.year}>Anual</MenuItem>
          </Select>
          <p className="text-xs text-grey mt-1">Afeta gráficos temporais</p>
        </Box>
      </div>

      {/* KPI Bar */}
      <div className="px-4 pb-2">
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              label="Total Cursinhos"
              value={geoSummary?.totalCourses ?? 0}
              color="marine"
              loading={kpiLoading}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              label="Conteúdos Aprovados"
              value={contentSummary?.contentApproved ?? 0}
              color="green"
              loading={kpiLoading}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              label="Conteúdos Pendentes"
              value={contentSummary?.contentPending ?? 0}
              color="orange"
              loading={kpiLoading}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              label="Questões Total"
              value={questionSummaryData?.questionTotal ?? 0}
              color="marine"
              loading={kpiLoading}
            />
          </Grid>
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
        </Grid>
      </div>

      <AnalyticsUsers period={period} />
      <AnalyticsGeolocation />
      <AnalyticsContent />
      <AnalyticsQuestion />
      <AnalyticsSimulado period={period} />
    </div>
  );
}

export default Analytics;
