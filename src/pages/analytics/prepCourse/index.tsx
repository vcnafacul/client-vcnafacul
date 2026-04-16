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

  const [dataTotalInscriptionCourse, setDataTotalInscriptionCourse] =
    useState<number>(0);
  const [
    dataTotalInscriptionStudentCourse,
    setDataTotalInscriptionStudentCourse,
  ] = useState<number>(0);
  const [
    dataTotalEnrollmentStudentCourse,
    setDataTotalEnrollmentStudentCourse,
  ] = useState<number>(0);

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
          setDataTotalInscriptionStudentCourse(
            summaryStudentCourse.totalStudents,
          );
          setDataTotalEnrollmentStudentCourse(
            summaryStudentCourse.studentEnrolled,
          );
          setDataTotalInscriptionCourse(
            summaryInscriptionCourse.inscriptionTotal,
          );

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
    if (dataNumberInscriptionsByPeriod.xAxis.length === 0) return;

    const periods = dataNumberInscriptionsByPeriod.xAxis;
    const total = dataNumberInscriptionsByPeriod.series[0]?.data || [];

    const rows = periods.map((period, index) => [period, total[index] ?? 0]);
    exportAnalyticsCsv(
      ["Período", "Inscrições no período"],
      rows,
      "analytics_cursinhos_periodo",
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
              value={dataTotalInscriptionCourse}
              color="marine"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              label="Total de inscrições realizadas"
              value={dataTotalInscriptionStudentCourse}
              color="green"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <StatCard
              label="Total de matrículas realizadas"
              value={dataTotalEnrollmentStudentCourse}
              color="red"
              loading={loading}
            />
          </Grid>
        </Grid>
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
