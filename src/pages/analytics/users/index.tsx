import { BarChartMuiProps } from "@/components/atoms/barChartMui";
import BarChartWithFilter from "@/components/atoms/barChartMuiFilter";
import LineChartMui, {
  LineChartMuiProps,
} from "@/components/atoms/lineChartMui";
import AnalyticsSection from "@/components/molecules/analyticsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Period } from "@/enums/analytics/period";
import { aggregateUserByLastAccess } from "@/services/analytics/user/aggregateLUserByLastAccess";
import { aggregateUserByPeriod } from "@/services/analytics/user/aggregateUserByPeriod";
import { aggregateUserByRole } from "@/services/analytics/user/aggregateUserByRole";
import {
  ultimoAcessoDoCursinho,
  usuariosPorPerfilDoCursinho,
} from "@/services/analytics/monitoramento";
import { useAuthStore } from "@/store/auth";
import { nomeDoArquivo } from "../nomeDoArquivo";
import { exportAnalyticsCsv } from "@/utils/exportAnalyticsCsv";
import { Button, Checkbox, FormControlLabel } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function AnalyticsUsers({
  period,
  cursinhoId,
  cursinhoNome,
}: {
  period: Period;
  /** tickets/044 — o cursinho do topo da tela. */
  cursinhoId?: string;
  cursinhoNome?: string;
}) {
  const {
    data: { token },
  } = useAuthStore();

  const [loading, setLoading] = useState(true);

  const [dataUserActive, setDataUserActive] = useState<LineChartMuiProps>({
    xAxis: [],
    series: [],
  });

  const [dataUserRole, setDataUserRole] = useState<BarChartMuiProps>({
    data: [],
  });

  const [dataUserLastAccess, setDataUserLastAccess] =
    useState<LineChartMuiProps>({
      xAxis: [],
      series: [],
    });

  const [baseOnly, setBaseOnly] = useState(false);

  useEffect(() => {
    // "Usuários Ativos e Total" some no recorte (D4): nada a buscar.
    if (cursinhoId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    aggregateUserByPeriod(period, token)
      .then((res) => {
        setDataUserActive({
          xAxis: res.map((r) => r.period),
          series: [
            { label: "Ativos", data: res.map((r) => r.active) },
            { label: "Total", data: res.map((r) => r.total) },
          ],
        });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [period, token, cursinhoId]);

  useEffect(() => {
    if (cursinhoId) {
      // Duas séries no recorte (D1): colaboradores ativos × estudantes.
      ultimoAcessoDoCursinho(cursinhoId, period, token)
        .then((res) => {
          setDataUserLastAccess({
            xAxis: res.map((r) => r.period),
            series: [
              { label: "Colaboradores", data: res.map((r) => r.colaboradores) },
              { label: "Estudantes", data: res.map((r) => r.estudantes) },
            ],
          });
        })
        .catch((err) => toast.error(err.message));
      return;
    }
    aggregateUserByLastAccess(period, token)
      .then((res) => {
        setDataUserLastAccess({
          xAxis: res.map((r) => r.period),
          series: [
            { label: "Último Acesso", data: res.map((r) => r.total) },
          ],
        });
      })
      .catch((err) => toast.error(err.message));
  }, [period, token, cursinhoId]);

  useEffect(() => {
    (cursinhoId
      ? usuariosPorPerfilDoCursinho(cursinhoId, baseOnly, token)
      : aggregateUserByRole(token, undefined, baseOnly || undefined)
    )
      .then((res) => {
        setDataUserRole({
          data: res.map((r) => ({
            id: r.name,
            label: r.name,
            value: r.total,
          })),
        });
      })
      .catch((err) => toast.error(err.message));
  }, [token, cursinhoId, baseOnly]);

  const handleExportCsv = () => {
    if (dataUserRole.data.length === 0) return;
    exportAnalyticsCsv(
      ["Perfil", "Total"],
      dataUserRole.data.map((d) => [d.label, d.value]),
      nomeDoArquivo("usuarios_por_perfil", cursinhoNome)
    );
  };

  return (
    <AnalyticsSection
      title="Usuários"
      actions={
        <Button size="small" variant="outlined" onClick={handleExportCsv}>
          Exportar CSV
        </Button>
      }
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <div className="shadow-md bg-white shadow-slate-200 p-2 rounded">
            <div className="flex items-center gap-4 px-2 pb-2">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={baseOnly}
                    onChange={(e) => setBaseOnly(e.target.checked)}
                    size="small"
                  />
                }
                label="Somente roles base"
              />
            </div>
            {loading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <BarChartWithFilter
                data={dataUserRole.data}
                title="Usuários por Perfil"
              />
            )}
          </div>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container direction="column" spacing={2}>
            <Grid>
              <div className="shadow-md bg-white shadow-slate-200 p-2 rounded">
                {loading ? (
                  <Skeleton className="h-[320px] w-full" />
                ) : (
                  <LineChartMui
                    {...dataUserLastAccess}
                    title="Último acesso dos usuários"
                    height={320}
                  />
                )}
              </div>
            </Grid>
            {/* Agrupa pela criação da conta: não diz nada sobre o cursinho (D4). */}
            {!cursinhoId && (
              <Grid>
                <div className="shadow-md bg-white shadow-slate-200 p-2 rounded">
                  {loading ? (
                    <Skeleton className="h-[320px] w-full" />
                  ) : (
                    <LineChartMui
                      {...dataUserActive}
                      title="Usuários Ativos e Total"
                      height={320}
                    />
                  )}
                </div>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </AnalyticsSection>
  );
}

export default AnalyticsUsers;
