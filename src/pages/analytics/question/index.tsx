import { PieChartMui } from "@/components/atoms/pieChartMui";
import StatCard from "@/components/atoms/statCard";
import AnalyticsSection from "@/components/molecules/analyticsSection";
import {
  provaSummary,
  ProvaSummary,
} from "@/services/analytics/prova/summary";
import {
  questionSummary,
  QuestionSummary,
} from "@/services/analytics/questoes/summary";
import { useAuthStore } from "@/store/auth";
import { exportAnalyticsCsv } from "@/utils/exportAnalyticsCsv";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function AnalyticsQuestion() {
  const {
    data: { token },
  } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [dataQuestionSummary, setDataQuestionSummary] =
    useState<QuestionSummary>({
      questionTotal: 0,
      questionPending: 0,
      questionApproved: 0,
      questionRejected: 0,
      questionReported: 0,
      questionClassified: 0,
    });

  const [dataProvaSummary, setDataProvaSummary] = useState<ProvaSummary>({
    provaTotal: 0,
  });

  useEffect(() => {
    setLoading(true);
    questionSummary(token)
      .then((res) => {
        setDataQuestionSummary(res);
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    provaSummary(token)
      .then((res) => {
        setDataProvaSummary(res);
      })
      .catch((err) => {
        toast.error(err.message);
      });
  }, [token]);

  const questionPieData = [
    {
      id: "aprovados",
      label: "Aprovados",
      value: dataQuestionSummary.questionApproved,
    },
    {
      id: "rejeitados",
      label: "Rejeitados",
      value: dataQuestionSummary.questionRejected,
    },
    {
      id: "pendentes",
      label: "Pendentes",
      value: dataQuestionSummary.questionPending,
    },
    {
      id: "reportadas",
      label: "Reportadas",
      value: dataQuestionSummary.questionReported,
    },
    {
      id: "classificadas",
      label: "Classificadas",
      value: dataQuestionSummary.questionClassified,
    },
  ];

  const handleExportCsv = () => {
    exportAnalyticsCsv(
      ["Métrica", "Valor"],
      [
        ["Questões Total", dataQuestionSummary.questionTotal],
        ["Questões Aprovadas", dataQuestionSummary.questionApproved],
        ["Questões Rejeitadas", dataQuestionSummary.questionRejected],
        ["Questões Pendentes", dataQuestionSummary.questionPending],
        ["Questões Reportadas", dataQuestionSummary.questionReported],
        ["Questões Classificadas", dataQuestionSummary.questionClassified],
        ["Provas Total", dataProvaSummary.provaTotal],
      ],
      "questoes_e_provas"
    );
  };

  return (
    <AnalyticsSection
      title="Questões e Provas"
      actions={
        <Button size="small" variant="outlined" onClick={handleExportCsv}>
          Exportar CSV
        </Button>
      }
    >
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <StatCard
                label="Total"
                value={dataQuestionSummary.questionTotal}
                color="marine"
                loading={loading}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <StatCard
                label="Aprovadas"
                value={dataQuestionSummary.questionApproved}
                color="green"
                loading={loading}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <StatCard
                label="Rejeitadas"
                value={dataQuestionSummary.questionRejected}
                color="red"
                loading={loading}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <StatCard
                label="Pendentes"
                value={dataQuestionSummary.questionPending}
                color="orange"
                loading={loading}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <StatCard
                label="Reportadas"
                value={dataQuestionSummary.questionReported}
                color="pink"
                loading={loading}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <StatCard
                label="Classificadas"
                value={dataQuestionSummary.questionClassified}
                color="marine"
                loading={loading}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <StatCard
                label="Provas Total"
                value={dataProvaSummary.provaTotal}
                color="marine"
                loading={loading}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid
          size={{ xs: 12, md: 5 }}
          className="flex justify-center"
        >
          {!loading && <PieChartMui data={questionPieData} />}
        </Grid>
      </Grid>
    </AnalyticsSection>
  );
}

export default AnalyticsQuestion;
