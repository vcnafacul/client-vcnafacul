import LineChartMui, {
  LineChartMuiProps,
} from "@/components/atoms/lineChartMui";
import AnalyticsSection from "@/components/molecules/analyticsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Period } from "@/enums/analytics/period";
import { getAggregateHistoricoByPeriod } from "@/services/analytics/simulado/aggregateByPeriod";
import { getAggregateHistoricoByPeriodAnType } from "@/services/analytics/simulado/aggregateByPeriodAndType";
import {
  MonitoramentoIndisponivel,
  simuladosPorPeriodoDoCursinho,
  simuladosPorTipoDoCursinho,
} from "@/services/analytics/monitoramento";
import { useAuthStore } from "@/store/auth";
import { Indisponivel } from "../Indisponivel";
import { nomeDoArquivo } from "../nomeDoArquivo";
import { exportAnalyticsCsv } from "@/utils/exportAnalyticsCsv";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function AnalyticsSimulado({
  period,
  cursinhoId,
  cursinhoNome,
}: {
  period: Period;
  /** tickets/044 — com cursinho, só os simulados das provas dele (D2). */
  cursinhoId?: string;
  cursinhoNome?: string;
}) {
  const {
    data: { token },
  } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [indisponivel, setIndisponivel] = useState(false);
  const avisar = (err: Error) => {
    if (err instanceof MonitoramentoIndisponivel) setIndisponivel(true);
    else toast.error(err.message);
  };

  const [dataSimulado, setDataSimulado] = useState<LineChartMuiProps>({
    xAxis: [],
    series: [],
  });

  const [dataSimuladoType, setDataSimuladoType] = useState<LineChartMuiProps>({
    xAxis: [],
    series: [],
  });

  useEffect(() => {
    setLoading(true);
    setIndisponivel(false);
    (cursinhoId
      ? simuladosPorPeriodoDoCursinho(cursinhoId, period, token)
      : getAggregateHistoricoByPeriod(period, token)
    )
      .then((res) => {
        setDataSimulado({
          xAxis: res.map((r) => r.period),
          series: [
            { label: "Completos", data: res.map((r) => r.completos) },
            { label: "Incompletos", data: res.map((r) => r.incompletos) },
            { label: "Total", data: res.map((r) => r.total) },
          ],
        });
      })
      .catch(avisar)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, token, cursinhoId]);

  useEffect(() => {
    (cursinhoId
      ? simuladosPorTipoDoCursinho(cursinhoId, period, token)
      : getAggregateHistoricoByPeriodAnType(period, token)
    )
      .then((res) => {
        // recorte sem simulado nenhum: gráfico vazio, não o do cursinho anterior
        if (res.length === 0) setDataSimuladoType({ xAxis: [], series: [] });
        if (res.length > 0) {
          setDataSimuladoType({
            xAxis: res[0].summary.map((s) => s.period),
            series: res.map((r) => ({
              label: r.tipo!,
              data: r.summary.map((s) => s.total),
            })),
          });
        }
      })
      .catch(avisar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, token, cursinhoId]);

  const handleExportPeriod = () => {
    if (dataSimulado.xAxis.length === 0) return;
    exportAnalyticsCsv(
      ["Período", ...dataSimulado.series.map((s) => s.label)],
      dataSimulado.xAxis.map((x, i) => [
        x,
        ...dataSimulado.series.map((s) => s.data[i]),
      ]),
      nomeDoArquivo("simulados_por_periodo", cursinhoNome),
    );
  };

  const handleExportType = () => {
    if (dataSimuladoType.xAxis.length === 0) return;
    exportAnalyticsCsv(
      ["Período", ...dataSimuladoType.series.map((s) => s.label)],
      dataSimuladoType.xAxis.map((x, i) => [
        x,
        ...dataSimuladoType.series.map((s) => s.data[i]),
      ]),
      nomeDoArquivo("simulados_por_tipo", cursinhoNome),
    );
  };

  return (
    <AnalyticsSection
      title={cursinhoId ? "Simulados das provas do cursinho" : "Simulados"}
      actions={
        <>
          <Button size="small" variant="outlined" onClick={handleExportPeriod}>
            CSV Período
          </Button>
          <Button size="small" variant="outlined" onClick={handleExportType}>
            CSV Tipo
          </Button>
        </>
      }
    >
      {indisponivel ? (
        <Indisponivel altura={200} />
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <div className="shadow-md bg-white shadow-slate-200 p-2 rounded">
              {loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <LineChartMui
                  {...dataSimulado}
                  title="Simulados resolvidos por período"
                  height={400}
                />
              )}
            </div>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <div className="shadow-md bg-white shadow-slate-200 p-2 rounded">
              {loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <LineChartMui
                  {...dataSimuladoType}
                  title="Simulados resolvidos por tipo"
                  height={400}
                />
              )}
            </div>
          </Grid>
        </Grid>
      )}
    </AnalyticsSection>
  );
}

export default AnalyticsSimulado;
