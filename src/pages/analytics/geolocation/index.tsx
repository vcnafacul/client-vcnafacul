import { PieChartMui } from "@/components/atoms/pieChartMui";
import StatCard from "@/components/atoms/statCard";
import AnalyticsSection from "@/components/molecules/analyticsSection";
import {
  GeolocationSummary,
  geolocationSummary,
} from "@/services/analytics/geolocation/summary-status";
import { useAuthStore } from "@/store/auth";
import { exportAnalyticsCsv } from "@/utils/exportAnalyticsCsv";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function AnalyticsGeolocation() {
  const {
    data: { token },
  } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GeolocationSummary>({
    approvedUniversities: 0,
    pendingUniversities: 0,
    rejectedUniversities: 0,
    withReportUniversities: 0,
    totalUniversities: 0,
    approvedCourses: 0,
    pendingCourses: 0,
    rejectedCourses: 0,
    withReportCourses: 0,
    totalCourses: 0,
  });

  useEffect(() => {
    setLoading(true);
    geolocationSummary(token)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const coursesPieData = [
    { id: "aprovados", label: "Aprovados", value: data.approvedCourses },
    { id: "rejeitados", label: "Rejeitados", value: data.rejectedCourses },
    { id: "pendentes", label: "Pendentes", value: data.pendingCourses },
    { id: "reportados", label: "Reportados", value: data.withReportCourses },
  ];

  const universitiesPieData = [
    {
      id: "aprovados",
      label: "Aprovados",
      value: data.approvedUniversities,
    },
    {
      id: "rejeitados",
      label: "Rejeitados",
      value: data.rejectedUniversities,
    },
    {
      id: "pendentes",
      label: "Pendentes",
      value: data.pendingUniversities,
    },
    {
      id: "reportados",
      label: "Reportados",
      value: data.withReportUniversities,
    },
  ];

  const handleExportCsv = () => {
    exportAnalyticsCsv(
      ["Categoria", "Total", "Aprovados", "Rejeitados", "Pendentes", "Reportados"],
      [
        [
          "Cursinhos",
          data.totalCourses,
          data.approvedCourses,
          data.rejectedCourses,
          data.pendingCourses,
          data.withReportCourses,
        ],
        [
          "Universidades",
          data.totalUniversities,
          data.approvedUniversities,
          data.rejectedUniversities,
          data.pendingUniversities,
          data.withReportUniversities,
        ],
      ],
      "geolocalizacao"
    );
  };

  return (
    <AnalyticsSection
      title="Geolocalização"
      actions={
        <Button size="small" variant="outlined" onClick={handleExportCsv}>
          Exportar CSV
        </Button>
      }
    >
      {/* Cursinhos */}
      <h3 className="text-lg font-bold text-marine mb-3">Cursinhos</h3>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Total"
            value={data.totalCourses}
            color="marine"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Aprovados"
            value={data.approvedCourses}
            color="green"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Rejeitados"
            value={data.rejectedCourses}
            color="red"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Pendentes"
            value={data.pendingCourses}
            color="orange"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Reportados"
            value={data.withReportCourses}
            color="pink"
            loading={loading}
          />
        </Grid>
        <Grid size={12} className="flex justify-center">
          {!loading && <PieChartMui data={coursesPieData} />}
        </Grid>
      </Grid>

      {/* Universidades */}
      <h3 className="text-lg font-bold text-marine mt-6 mb-3">
        Universidades
      </h3>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Total"
            value={data.totalUniversities}
            color="marine"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Aprovados"
            value={data.approvedUniversities}
            color="green"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Rejeitados"
            value={data.rejectedUniversities}
            color="red"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Pendentes"
            value={data.pendingUniversities}
            color="orange"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
          <StatCard
            label="Reportados"
            value={data.withReportUniversities}
            color="pink"
            loading={loading}
          />
        </Grid>
        <Grid size={12} className="flex justify-center">
          {!loading && <PieChartMui data={universitiesPieData} />}
        </Grid>
      </Grid>
    </AnalyticsSection>
  );
}

export default AnalyticsGeolocation;
