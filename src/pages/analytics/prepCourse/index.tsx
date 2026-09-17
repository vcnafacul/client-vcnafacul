import LineChartMui, {
  LineChartMuiProps,
} from "@/components/atoms/lineChartMui";
import StatCard from "@/components/atoms/statCard";
import AnalyticsSection from "@/components/molecules/analyticsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Period } from "@/enums/analytics/period";

import { aggregateStudentCourseByPeriod } from "@/services/analytics/prepCourse/aggregateStudentCourseByPeriod";
import { getSummaryInscriptionCourse } from "@/services/analytics/prepCourse/getSummaryInscriptionCourse";
import { getSummaryStudentCourse } from "@/services/analytics/prepCourse/getSummaryStudentCourse";
import { SummaryInscriptionCourse } from "@/services/analytics/prepCourse/dtos/summary-inscription-course";
import { SummaryStudentCourse } from "@/services/analytics/prepCourse/dtos/summary-student-course";
import { useAuthStore } from "@/store/auth";
import { exportAnalyticsCsv } from "@/utils/exportAnalyticsCsv";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function AnalyticsPrepCourse({ period }: { period: Period }) {
  const {
    data: { token },
  } = useAuthStore();

  const [loading, setLoading] = useState(true);

  const [dataNumberInscriptionsByPeriod, setDataNumberInscriptionsByPeriod] =
    useState<LineChartMuiProps>({ xAxis: [], series: [] });

  const [summaryInscriptionCourse, setSummaryInscriptionCourse] =
    useState<SummaryInscriptionCourse | null>(null);
  const [summaryStudentCourse, setSummaryStudentCourse] =
    useState<SummaryStudentCourse | null>(null);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      getSummaryStudentCourse(token),
      getSummaryInscriptionCourse(token),
      aggregateStudentCourseByPeriod(period, token),
    ])
      .then(
        ([
          summaryStudentCourse,
          summaryInscriptionCourse,
          aggregateStudentCourseByPeriod,
        ]) => {
          setSummaryStudentCourse(summaryStudentCourse);
          setSummaryInscriptionCourse(summaryInscriptionCourse);

          const studentXAxis = aggregateStudentCourseByPeriod.map(
            (r) => r.period,
          );

          setDataNumberInscriptionsByPeriod({
            xAxis: studentXAxis,
            series: [
              {
                label: "Número de inscrições",
                data: aggregateStudentCourseByPeriod.map(
                  (r) => r.totalInscriptions,
                ),
              },
            ],
          });
        },
      )
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [period, token]);

  const handleExportCsv = () => {
    if (!summaryInscriptionCourse || !summaryStudentCourse) return;

    const periods = dataNumberInscriptionsByPeriod.xAxis;
    const total = dataNumberInscriptionsByPeriod.series[0]?.data || [];

    const rows = [
      ...periods.map((period, index) => [period, total[index] ?? 0]),
      [],
      ["Métrica", "Valor"],
      [
        "Total de processos seletivos realizados (sem testes)",
        summaryInscriptionCourse.inscriptionTotalNonTest,
      ],
      [
        "Total de processos seletivos realizados (incluindo testes)",
        summaryInscriptionCourse.inscriptionTotal,
      ],
      [
        "Total de inscrições realizadas (sem testes)",
        summaryStudentCourse.totalStudentsNonTest,
      ],
      [
        "Total de matrículas realizadas (sem testes)",
        summaryStudentCourse.studentEnrolledNonTest,
      ],
    ];
    exportAnalyticsCsv(
      ["Período", "Inscrições no período (incluindo testes)"],
      rows,
      "analytics_cursinhos",
    );
  };

  return (
    <AnalyticsSection
      title="Cursinhos"
      actions={
        <Button size="small" variant="outlined" onClick={handleExportCsv}>
          Exportar CSV
        </Button>
      }
    >
      <Grid size={{ xs: 12, md: 7 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              label="Total de processos seletivos realizados"
              value={summaryInscriptionCourse?.inscriptionTotalNonTest ?? 0}
              secondaryValue={summaryInscriptionCourse?.inscriptionTotal ?? 0}
              color="marine"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              label="Total de inscrições realizadas"
              value={summaryStudentCourse?.totalStudentsNonTest ?? 0}
              color="green"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              label="Total de matrículas realizadas"
              value={summaryStudentCourse?.studentEnrolledNonTest ?? 0}
              color="red"
              loading={loading}
            />
          </Grid>
        </Grid>
        <p className="text-xs text-grey mt-2">
          Totais sem processos seletivos de teste. Entre parênteses, o total
          incluindo testes.
        </p>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <div className="shadow-md bg-white shadow-slate-200 p-2 rounded">
          {loading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <LineChartMui
              {...dataNumberInscriptionsByPeriod}
              title="Quantidade de inscrições por período"
              height={320}
            />
          )}
        </div>
      </Grid>
    </AnalyticsSection>
  );
}

export default AnalyticsPrepCourse;
