import LineChartMui, {
  LineChartMuiProps,
} from "@/components/atoms/lineChartMui";
import { Period } from "@/enums/analytics/period";
import { getAggregateHistoricoByPeriod } from "@/services/analytics/simulado/aggregateByPeriod";
import { getAggregateHistoricoByPeriodAnType } from "@/services/analytics/simulado/aggregateByPeriodAndType";
import { useAuthStore } from "@/store/auth";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";

function AnalyticsSimulado({ period }: { period: Period }) {
  const {
    data: { token },
  } = useAuthStore();

  const [dataSimulado, setDataSimulado] = useState<LineChartMuiProps>({
    xAxis: [],
    series: [],
  });

    const [dataSimuladoType, setDataSimuladoType] = useState<LineChartMuiProps>({
        xAxis: [],
        series: [],
      });

  useEffect(() => {
    getAggregateHistoricoByPeriod(period, token).then((res) => {
      setDataSimulado({
        xAxis: res.map((r) => r.period),
        series: [
          { label: "Completos", data: res.map((r) => r.completos) },
          { label: "Incompleto", data: res.map((r) => r.incompletos) },
          { label: "Total", data: res.map((r) => r.total) },
        ],
      });
    });
  }, [period, token]);

    useEffect(() => {
      getAggregateHistoricoByPeriodAnType(period, token).then((res) => {
        if (res.length > 0) {
          setDataSimuladoType({
            xAxis: res[0].summary.map(s => s.period),
            series: res.map(r => ({ label: r.tipo!, data: r.summary.map(s => s.total) })),
          });
        }
      });
    }, [period, token]);

  return (
    <>
      {/* Header */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h5" fontWeight="bold" className="text-marine">
            Usuários
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Conteúdo */}
      <Box p={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }} className="shadow-md bg-white shadow-slate-200 p-2 rounded">
            <LineChartMui
              {...dataSimulado}
              title="Simulados resolvidos por período"
              height={400}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} className="shadow-md bg-white shadow-slate-200 p-2 rounded">
            <LineChartMui
              {...dataSimuladoType}
              title="Simulados resolvidos por tipo"
              height={400}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default AnalyticsSimulado;
