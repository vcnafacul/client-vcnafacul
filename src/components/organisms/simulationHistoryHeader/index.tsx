import { Button } from "@/components/ui/button";
import { Box, Chip, Grid, Paper, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts";
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HistoricoDTO } from "../../../dtos/historico/historicoDTO";
import { DASH, SIMULADO_HISTORIES } from "../../../routes/path";
import { getFormatingTime } from "../../../utils/getFormatingTime";
import { RadarChart } from "../../atoms/radarChart";

interface SimulationHistoryHeaderProps {
  historic: HistoricoDTO;
}

export function SimulationHistoryHeader({
  historic,
}: SimulationHistoryHeaderProps) {
  const navigate = useNavigate();

  const finished =
    historic.simulado.tipo.quantidadeTotalQuestao ===
    historic.questoesRespondidas;

  // Prepara dados do Radar (aproveitamento por matéria)
  const radarData = historic.aproveitamento.materias.map((m) => ({
    materia: m.nome,
    aproveitamento: parseFloat((m.aproveitamento * 100).toFixed(1)),
  }));

  // Prepara dados do Pie (acertos/erros)
  const acertos = historic.respostas.filter(
    (r) => r.alternativaCorreta === r.alternativaEstudante
  ).length;

  const erros = historic.respostas.filter(
    (r) =>
      r.alternativaEstudante !== undefined &&
      r.alternativaCorreta !== r.alternativaEstudante
  ).length;

  const naoRespondidas = historic.respostas.filter(
    (r) => r.alternativaEstudante === undefined
  ).length;

  const pieData = [
    { id: 0, value: acertos, label: "Acertos", color: "#22c55e" },
    { id: 1, value: erros, label: "Erros", color: "#ef4444" },
    {
      id: 2,
      value: naoRespondidas,
      label: "Não Respondidas",
      color: "#f59e0b",
    },
  ];

  const aproveitamentoGeral = (historic.aproveitamento.geral * 100).toFixed(1);
  const totalQuestoes = historic.simulado.tipo.quantidadeTotalQuestao;
  const percentualAcertos = ((acertos / totalQuestoes) * 100).toFixed(1);
  const percentualErros = ((erros / totalQuestoes) * 100).toFixed(1);

  // Encontra melhor e pior matéria
  const melhorMateria = radarData.reduce((prev, current) =>
    prev.aproveitamento > current.aproveitamento ? prev : current
  );
  const piorMateria = radarData.reduce((prev, current) =>
    prev.aproveitamento < current.aproveitamento ? prev : current
  );

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: "white", fontWeight: "bold", display: "flex", gap: 1 }}
        >
          <BookOpen className="h-8 w-8" />
          Detalhes do Simulado
        </Typography>
        <Button
          onClick={() => navigate(`${DASH}/${SIMULADO_HISTORIES}`)}
          variant="outline"
          className="bg-white hover:bg-gray-100"
        >
          Voltar
        </Button>
      </Box>

      {/* Card Principal de Aproveitamento */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              {historic.simulado.tipo.nome} - {historic.ano}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Award className="h-12 w-12" />
              <Box>
                <Typography variant="h3" fontWeight="bold">
                  {aproveitamentoGeral}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Aproveitamento Geral
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Chip
              icon={
                finished ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )
              }
              label={finished ? "Completo" : "Incompleto"}
              sx={{
                bgcolor: finished
                  ? "rgba(34, 197, 94, 0.2)"
                  : "rgba(251, 146, 60, 0.2)",
                color: "white",
                fontWeight: "bold",
                fontSize: "1rem",
                px: 2,
                py: 3,
                "& .MuiChip-icon": {
                  color: "white",
                },
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Cards de Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              color: "white",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CheckCircle2 className="h-5 w-5" />
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Acertos
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {acertos}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {percentualAcertos}% do total
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "white",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <XCircle className="h-5 w-5" />
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Erros
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {erros}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {percentualErros}% do total
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "white",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AlertCircle className="h-5 w-5" />
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Não Respondidas
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {naoRespondidas}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              de {totalQuestoes} questões
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Clock className="h-5 w-5" />
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Tempo Gasto
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {getFormatingTime(historic.tempoRealizado).split(" ")[0]}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {getFormatingTime(historic.tempoRealizado).split(" ")[1]}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Radar Chart - Aproveitamento por Matéria */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: "100%" }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Target className="h-5 w-5" />
              Desempenho por Matéria
            </Typography>
            <Box sx={{ height: 400 }}>
              <RadarChart
                data={radarData}
                scheme="category10"
                fill="#374151"
                dotSize={12}
                dotBorderWidth={4}
              />
            </Box>

            {/* Insights */}
            <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Chip
                icon={<TrendingUp className="h-4 w-4" />}
                label={`Melhor: ${
                  melhorMateria.materia
                } (${melhorMateria.aproveitamento.toFixed(1)}%)`}
                color="success"
                variant="outlined"
              />
              <Chip
                icon={<AlertCircle className="h-4 w-4" />}
                label={`Precisa melhorar: ${
                  piorMateria.materia
                } (${piorMateria.aproveitamento.toFixed(1)}%)`}
                color="warning"
                variant="outlined"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Pie Chart - Distribuição de Respostas */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: "100%" }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Target className="h-5 w-5" />
              Distribuição de Respostas
            </Typography>
            <Box
              sx={{
                height: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PieChart
                series={[
                  {
                    data: pieData,
                    highlightScope: { faded: "global", highlighted: "item" },
                    faded: {
                      innerRadius: 30,
                      additionalRadius: -30,
                      color: "gray",
                    },
                    innerRadius: 50,
                    outerRadius: 120,
                    paddingAngle: 2,
                    cornerRadius: 5,
                    arcLabel: (item) => `${item.value}`,
                    arcLabelMinAngle: 20,
                  },
                ]}
                width={400}
                height={400}
                slotProps={{
                  legend: {
                    direction: "column",
                    position: { vertical: "middle", horizontal: "right" },
                    padding: -30,
                    itemMarkWidth: 6,
                    itemMarkHeight: 15,
                    markGap: 8,
                    itemGap: 8,
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recomendações */}
      {/* {parseFloat(aproveitamentoGeral) < 70 && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mt: 3,
            background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
            color: "white",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            💡 Dicas para Melhorar
          </Typography>
          <Typography variant="body1">
            Seu aproveitamento está abaixo de 70%. Foque especialmente em{" "}
            <strong>{piorMateria.materia}</strong>, onde você teve o menor
            desempenho ({piorMateria.aproveitamento.toFixed(1)}%). Continue
            praticando e revisando os conteúdos!
          </Typography>
        </Paper>
      )} */}
    </Box>
  );
}
