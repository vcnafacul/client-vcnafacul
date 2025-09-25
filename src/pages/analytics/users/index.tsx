import { BarChartMuiProps } from "@/components/atoms/barChartMui";
import BarChartWithFilter from "@/components/atoms/barChartMuiFilter";
import LineChartMui, {
    LineChartMuiProps,
} from "@/components/atoms/lineChartMui";
import { Period } from "@/enums/analytics/period";
import { aggregateUserByLastAccess } from "@/services/analytics/user/aggregateLUserByLastAccess";
import { aggregateUserByPeriod } from "@/services/analytics/user/aggregateUserByPeriod";
import { aggregateUserByRole } from "@/services/analytics/user/aggregateUserByRole";
import { useAuthStore } from "@/store/auth";
import {
    AppBar,
    Box,
    Toolbar,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";

function AnalyticsUsers({ period }: { period: Period }) {
  const {
    data: { token },
  } = useAuthStore();

  const [dataUserActive, setDataUserActive] = useState<LineChartMuiProps>({
    xAxis: [],
    series: [],
  });

  const [dataUserRole, setDataUserRole] = useState<BarChartMuiProps>({
    data: [],
  });

  const [dataUserLAstAccess, setDataUserLastAccess] =
    useState<LineChartMuiProps>({
      xAxis: [],
      series: [],
    });

  useEffect(() => {
    aggregateUserByPeriod(period, token).then((res) => {
      setDataUserActive({
        xAxis: res.map((r) => r.period),
        series: [
          { label: "Ativos", data: res.map((r) => r.active) },
          { label: "Total", data: res.map((r) => r.total) },
        ],
      });
    });
  }, [period, token]);

  useEffect(() => {
    aggregateUserByLastAccess(period, token).then((res) => {
      setDataUserLastAccess({
        xAxis: res.map((r) => r.period),
        series: [{ label: "Útimo Acesso", data: res.map((r) => r.total) }],
      });
    });
  }, [period, token]);

  useEffect(() => {
    aggregateUserByRole(token).then((res) => {
      setDataUserRole({
        data: res.map((r) => ({
          id: r.name,
          label: r.name,
          value: r.total,
        })),
      });
    });
  }, [period, token]);

  console.log(dataUserRole);

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
          <Grid size={{ xs: 12, md: 6 }}>
            <LineChartMui {...dataUserActive} title="Usuários Ativos e Total" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <LineChartMui
              {...dataUserLAstAccess}
              title="Ultimo acesso dos usuarios"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <BarChartWithFilter
              data={dataUserRole.data}
              title="Usuários por Perfil"
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default AnalyticsUsers;
