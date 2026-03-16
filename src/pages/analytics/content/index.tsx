import LineChartMui, {
  LineChartMuiProps,
} from "@/components/atoms/lineChartMui";
import AnalyticsSection from "@/components/molecules/analyticsSection";
import { Skeleton } from "@/components/ui/skeleton";
import ExpandableTable, {
  TableColumn,
} from "@/components/organisms/expandableTable";
import { getContentSnapshotContentStatus } from "@/services/analytics/content/snapshotContentStatus";
import {
  ContentStatsByFrente,
  getContentSummary,
} from "@/services/analytics/content/statsByFrente";
import { useAuthStore } from "@/store/auth";
import { exportAnalyticsCsv } from "@/utils/exportAnalyticsCsv";
import { Button } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type AggregatedMateria = {
  materia: number;
  qtdFrentes: number;
  pendentes_upload: number;
  pendentes: number;
  aprovados: number;
  reprovados: number;
  total: number;
};

function aggregateMateria(
  frentes: ContentStatsByFrente[] | ContentStatsByFrente
): AggregatedMateria {
  const frentesArray = frentes as ContentStatsByFrente[];
  return frentesArray.reduce(
    (acc, f) => {
      acc.pendentes_upload += Number(f.pendentes_upload);
      acc.pendentes += Number(f.pendentes);
      acc.aprovados += Number(f.aprovados);
      acc.reprovados += Number(f.reprovados);
      acc.total += Number(f.total);
      return acc;
    },
    {
      materia: frentesArray[0]?.materia || 0,
      qtdFrentes: frentesArray.length,
      pendentes_upload: 0,
      pendentes: 0,
      aprovados: 0,
      reprovados: 0,
      total: 0,
    }
  );
}

function groupByMateria(item: ContentStatsByFrente): string | number {
  return item.materia;
}

function renderFrentesTable(
  frentes: ContentStatsByFrente[] | ContentStatsByFrente
) {
  const frentesArray = frentes as ContentStatsByFrente[];
  return (
    <Table size="small" aria-label="frentes">
      <TableHead>
        <TableRow>
          <TableCell>Frente</TableCell>
          <TableCell align="right">Pendente Upload</TableCell>
          <TableCell align="right">Pendentes</TableCell>
          <TableCell align="right">Aprovados</TableCell>
          <TableCell align="right">Reprovados</TableCell>
          <TableCell align="right">Total</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {frentesArray.map((frente) => (
          <TableRow key={frente.frente}>
            <TableCell>{frente.frente}</TableCell>
            <TableCell align="right">{frente.pendentes_upload}</TableCell>
            <TableCell align="right">{frente.pendentes}</TableCell>
            <TableCell align="right">{frente.aprovados}</TableCell>
            <TableCell align="right">{frente.reprovados}</TableCell>
            <TableCell align="right">{frente.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AnalyticsContent() {
  const {
    data: { token },
  } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [contentSummary, setContentSummary] = useState<ContentStatsByFrente[]>(
    []
  );
  const [dataContentStatus, setDataContentStatus] = useState<LineChartMuiProps>(
    {
      xAxis: [],
      series: [],
    }
  );

  const columns: TableColumn<AggregatedMateria>[] = [
    { key: "materia", label: "Matéria" },
    { key: "qtdFrentes", label: "Qtd. Frentes", align: "right" },
    { key: "pendentes_upload", label: "Pend. Upload", align: "right" },
    { key: "pendentes", label: "Pendentes", align: "right" },
    { key: "aprovados", label: "Aprovados", align: "right" },
    { key: "reprovados", label: "Reprovados", align: "right" },
    { key: "total", label: "Total", align: "right" },
  ];

  useEffect(() => {
    setLoading(true);
    getContentSummary(token)
      .then((res) => {
        setContentSummary(res);
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    getContentSnapshotContentStatus(token)
      .then((res) => {
        const xAxis = res.map((r) => r.snapshot_date.toString());
        const series = [
          {
            label: "Pendentes Upload",
            data: res.map((r) => r.pendentes_upload),
          },
          { label: "Pendentes", data: res.map((r) => r.pendentes) },
          { label: "Aprovados", data: res.map((r) => r.aprovados) },
          { label: "Reprovados", data: res.map((r) => r.reprovados) },
          { label: "Total", data: res.map((r) => r.total) },
        ];
        setDataContentStatus({
          xAxis,
          series,
          title: "Status de Conteúdos Diário",
        });
      })
      .catch((err) => {
        toast.error(err.message);
      });
  }, [token]);

  const handleExportCsv = () => {
    if (contentSummary.length === 0) return;
    exportAnalyticsCsv(
      [
        "Matéria",
        "Frente",
        "Pend. Upload",
        "Pendentes",
        "Aprovados",
        "Reprovados",
        "Total",
      ],
      contentSummary.map((f) => [
        f.materia,
        f.frente,
        f.pendentes_upload,
        f.pendentes,
        f.aprovados,
        f.reprovados,
        f.total,
      ]),
      "conteudos_por_frente"
    );
  };

  return (
    <AnalyticsSection
      title="Conteúdos"
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
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <ExpandableTable
                data={contentSummary}
                columns={columns}
                groupBy={groupByMateria}
                aggregate={aggregateMateria}
                expandableContent={renderFrentesTable}
                expandableTitle="Frentes"
              />
            )}
          </div>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <div className="shadow-md bg-white shadow-slate-200 p-2 rounded">
            {loading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <LineChartMui {...dataContentStatus} />
            )}
          </div>
        </Grid>
      </Grid>
    </AnalyticsSection>
  );
}

export default AnalyticsContent;
