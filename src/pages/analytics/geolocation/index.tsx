import { PieChartMui } from "@/components/atoms/pieChartMui";
import StatCard from "@/components/atoms/statCard";
import AnalyticsSection from "@/components/molecules/analyticsSection";
import {
  GeolocationSummary,
  geolocationSummary,
} from "@/services/analytics/geolocation/summary-status";
import { useAuthStore } from "@/store/auth";
import { exportAnalyticsCsv } from "@/utils/exportAnalyticsCsv";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";

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
        <Button size="sm" variant="outline" onClick={handleExportCsv}>
          Exportar CSV
        </Button>
      }
    >
      {/* Cursinhos */}
      <h3 className="text-h3 font-bold text-foreground mb-3">Cursinhos</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        <div className="min-w-0">
          <StatCard
            label="Total"
            value={data.totalCourses}
            color="marine"
            loading={loading}
          />
        </div>
        <div className="min-w-0">
          <StatCard
            label="Aprovados"
            value={data.approvedCourses}
            color="green"
            loading={loading}
          />
        </div>
        <div className="min-w-0">
          <StatCard
            label="Rejeitados"
            value={data.rejectedCourses}
            color="red"
            loading={loading}
          />
        </div>
        <div className="min-w-0">
          <StatCard
            label="Pendentes"
            value={data.pendingCourses}
            color="orange"
            loading={loading}
          />
        </div>
        <div className="min-w-0">
          <StatCard
            label="Reportados"
            value={data.withReportCourses}
            color="pink"
            loading={loading}
          />
        </div>
        <div className="col-span-full flex justify-center">
          {!loading && <PieChartMui data={coursesPieData} />}
        </div>
      </div>

      {/* Universidades */}
      <h3 className="text-h3 font-bold text-foreground mt-6 mb-3">
        Universidades
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        <div className="min-w-0">
          <StatCard
            label="Total"
            value={data.totalUniversities}
            color="marine"
            loading={loading}
          />
        </div>
        <div className="min-w-0">
          <StatCard
            label="Aprovados"
            value={data.approvedUniversities}
            color="green"
            loading={loading}
          />
        </div>
        <div className="min-w-0">
          <StatCard
            label="Rejeitados"
            value={data.rejectedUniversities}
            color="red"
            loading={loading}
          />
        </div>
        <div className="min-w-0">
          <StatCard
            label="Pendentes"
            value={data.pendingUniversities}
            color="orange"
            loading={loading}
          />
        </div>
        <div className="min-w-0">
          <StatCard
            label="Reportados"
            value={data.withReportUniversities}
            color="pink"
            loading={loading}
          />
        </div>
        <div className="col-span-full flex justify-center">
          {!loading && <PieChartMui data={universitiesPieData} />}
        </div>
      </div>
    </AnalyticsSection>
  );
}

export default AnalyticsGeolocation;
