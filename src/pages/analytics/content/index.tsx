import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { ContentSummary, getContentSummary } from "@/services/analytics/content/summary";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from 'react';
import { toast } from "react-toastify";

type GroupedData = {
  materia: string | number;
  frentes: ContentSummary[];
};

// função para agrupar os dados por matéria
function groupByMateria(data: ContentSummary[]): GroupedData[] {
  const grouped: Record<string, ContentSummary[]> = {};

  data.forEach((item) => {
    if (!grouped[item.materia]) {
      grouped[item.materia] = [];
    }
    grouped[item.materia].push(item);
  });

  return Object.entries(grouped).map(([materia, frentes]) => ({
    materia,
    frentes,
  }));
}

function aggregateMateria(frentes: ContentSummary[]) {
  return frentes.reduce(
    (acc, f) => {
      acc.pendentes_upload += Number(f.pendentes_upload);
      acc.pendentes += Number(f.pendentes);
      acc.aprovados += Number(f.aprovados);
      acc.reprovados += Number(f.reprovados);
      acc.total += Number(f.total);
      return acc;
    },
    { pendentes_upload: 0, pendentes: 0, aprovados: 0, reprovados: 0, total: 0 }
  );
}


function Row({ row }: { row: GroupedData }) {
  const [open, setOpen] = useState(false);

  const aggregated = aggregateMateria(row.frentes);

  return (
    <>
      {/* Linha principal (matéria + agregados) */}
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <FiChevronUp /> : <FiChevronDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.materia}
        </TableCell>
        <TableCell align="right">{row.frentes.length}</TableCell>
        <TableCell align="right">{aggregated.pendentes_upload}</TableCell>
        <TableCell align="right">{aggregated.pendentes}</TableCell>
        <TableCell align="right">{aggregated.aprovados}</TableCell>
        <TableCell align="right">{aggregated.reprovados}</TableCell>
        <TableCell align="right">{aggregated.total}</TableCell>
      </TableRow>

      {/* Linha expandida (detalhe por frente) */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Frentes
              </Typography>
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
                  {row.frentes.map((frente) => (
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
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}


export function AnalyticsContent() {

    const { data: { token } } = useAuthStore();
    const [contentSummary, setContentSummary] = useState<ContentSummary[]>([] as ContentSummary[]);
    
    useEffect(() => {
        getContentSummary(token)
            .then((res) => {
                setContentSummary(res);
            })
            .catch((err) => {
                toast.error(err.message);
            })
    }, [])
        
  const grouped = groupByMateria(contentSummary);

  return (
    <TableContainer component={Paper} className="px-4">
      <Table aria-label="collapsible table">
        <TableHead>
            <TableRow>
                <TableCell />
                <TableCell>Matéria</TableCell>
                <TableCell align="right">Qtd. Frentes</TableCell>
                <TableCell align="right">Pend. Upload</TableCell>
                <TableCell align="right">Pendentes</TableCell>
                <TableCell align="right">Aprovados</TableCell>
                <TableCell align="right">Reprovados</TableCell>
                <TableCell align="right">Total</TableCell>
            </TableRow>
            </TableHead>
        <TableBody>
          {grouped.map((row) => (
            <Row key={row.materia} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AnalyticsContent;