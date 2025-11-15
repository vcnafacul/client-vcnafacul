import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import LineChartMui, {
  LineChartMuiProps,
} from "@/components/atoms/lineChartMui";
import ExpandableTable, {
  TableColumn,
} from "@/components/organisms/expandableTable";
import { getContentSnapshotContentStatus } from "@/services/analytics/content/snapshotContentStatus";
import {
  ContentStatsByFrente,
  getContentSummary,
} from "@/services/analytics/content/statsByFrente";
import { useAuthStore } from "@/store/auth";
import { AppBar, Toolbar } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Tipo para os dados agregados
type AggregatedMateria = {
  materia: number;
  qtdFrentes: number;
  pendentes_upload: number;
  pendentes: number;
  aprovados: number;
  reprovados: number;
  total: number;
};

// Função para agregar dados por matéria
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

// Função para agrupar por matéria
function groupByMateria(item: ContentStatsByFrente): string | number {
  return item.materia;
}

// Componente para renderizar o conteúdo expandido (tabela de frentes)
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
  const [contentSummary, setContentSummary] = useState<ContentStatsByFrente[]>(
    [] as ContentStatsByFrente[]
  );

  const [dataContentStatus, setDataContentStatus] = useState<LineChartMuiProps>(
    {
      xAxis: [],
      series: [],
    }
  );

  // Definição das colunas da tabela
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
    getContentSummary(token)
      .then((res) => {
        setContentSummary(res);
      })
      .catch((err) => {
        toast.error(err.message);
      });
  }, [token]);

  useEffect(() => {
    getContentSnapshotContentStatus(token).then((res) => {
      const xAxis = res.map((r) => r.snapshot_date.toString());
      const series = [
        { label: "Pendentes Upload", data: res.map((r) => r.pendentes_upload) },
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
    });
  }, [token]);

  return (
    <>
      {/* Header */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h4" fontWeight="bold" className="text-marine">
            Conteúdos
          </Typography>
        </Toolbar>
      </AppBar>
      <Box p={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ExpandableTable
              data={contentSummary}
              columns={columns}
              groupBy={groupByMateria}
              aggregate={aggregateMateria}
              expandableContent={renderFrentesTable}
              expandableTitle="Frentes"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <LineChartMui {...dataContentStatus} />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default AnalyticsContent;
