import LineChartMui, {
  LineChartMuiProps,
} from "@/components/atoms/lineChartMui";
import AnalyticsSection from "@/components/molecules/analyticsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Period } from "@/enums/analytics/period";
import { aggregateInscriptionCourseByPeriod } from "@/services/analytics/prepCourse/aggregateInscriptionCourseByPeriod";
import { aggregateStudentCourseByPeriod } from "@/services/analytics/prepCourse/aggregateStudentCourseByPeriod";
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

  const [dataInscriptionCourse, setDataInscriptionCourse] =
    useState<LineChartMuiProps>({
      xAxis: [],
      series: [],
    });

  const [dataInscriptionCourseCumulative, setDataInscriptionCourseCumulative] =
    useState<LineChartMuiProps>({
      xAxis: [],
      series: [],
    });

  const [dataCumulativeInscriptions, setDataCumulativeInscriptions] =
    useState<LineChartMuiProps>({ xAxis: [], series: [] });

  const [dataCumulativeEnrolments, setDataCumulativeEnrolments] =
    useState<LineChartMuiProps>({ xAxis: [], series: [] });

  useEffect(() => {
    setLoading(true);

    Promise.all([
      aggregateInscriptionCourseByPeriod(period, token),
      aggregateStudentCourseByPeriod(period, token),
    ])
      .then(([inscriptionRes, studentRes]) => {
        const xAxis = inscriptionRes.map((r) => r.period);

        setDataInscriptionCourse({
          xAxis,
          series: [
            {
              label: "Total",
              data: inscriptionRes.map((r) => r.total),
            },
          ],
        });

        setDataInscriptionCourseCumulative({
          xAxis,
          series: [
            {
              label: "Acumulado",
              data: inscriptionRes.map((r) => r.cumulativeTotal),
            },
          ],
        });

        const studentXAxis = studentRes.map((r) => r.period);

        setDataCumulativeInscriptions({
          xAxis: studentXAxis,
          series: [
            {
              label: "Inscrições acumuladas",
              data: studentRes.map((r) => r.cumulativeInscriptionsTotal),
            },
          ],
        });

        setDataCumulativeEnrolments({
          xAxis: studentXAxis,
          series: [
            {
              label: "Matrículas acumuladas",
              data: studentRes.map((r) => r.cumulativeEnrolmentsTotal),
            },
          ],
        });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [period, token]);

  const handleExportCsv = () => {
    if (dataInscriptionCourse.xAxis.length === 0) return;

    const periods = dataInscriptionCourse.xAxis;

    const total = dataInscriptionCourse.series[0]?.data || [];
    const cumulative = dataInscriptionCourseCumulative.series[0]?.data || [];
    const cumulativeInscriptions =
      dataCumulativeInscriptions.series[0]?.data || [];
    const cumulativeEnrolments = dataCumulativeEnrolments.series[0]?.data || [];

    const rows = periods.map((period, index) => [
      period,
      total[index] ?? 0,
      cumulative[index] ?? 0,
      cumulativeInscriptions[index] ?? 0,
      cumulativeEnrolments[index] ?? 0,
    ]);

    exportAnalyticsCsv(
      [
        "Período",
        "Inscrições no período",
        "Inscrições acumuladas (geral)",
        "Inscrições acumuladas (alunos)",
        "Matrículas acumuladas",
      ],
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
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <div className="shadow-md bg-white shadow-slate-200 p-2 rounded">
            {loading ? (
              <Skeleton className="h-[320px] w-full" />
            ) : (
              <LineChartMui
                {...dataInscriptionCourse}
                title="Quantidade de processos seletivos realizados"
                height={320}
              />
            )}
          </div>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <div className="shadow-md bg-white shadow-slate-200 p-2 rounded">
            {loading ? (
              <Skeleton className="h-[320px] w-full" />
            ) : (
              <LineChartMui
                {...dataInscriptionCourseCumulative}
                title="Acumulado da quantidade de processos seletivos"
                height={320}
              />
            )}
          </div>
        </Grid>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <div className="shadow-md bg-white shadow-slate-200 p-2 rounded">
          {loading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <LineChartMui
              {...dataCumulativeInscriptions}
              title="Quantidade de inscrições"
              height={320}
            />
          )}
        </div>
      </Grid>

      {/* Cumulative Enrolments */}
      <Grid size={{ xs: 12, md: 6 }}>
        <div className="shadow-md bg-white shadow-slate-200 p-2 rounded">
          {loading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <LineChartMui
              {...dataCumulativeEnrolments}
              title="Quantidade de matrículas"
              height={320}
            />
          )}
        </div>
      </Grid>
    </AnalyticsSection>
  );
}

export default AnalyticsPrepCourse;
