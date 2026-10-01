import { Button } from "@/components/ui/button";
import {
  Box,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import { PieChart } from "@mui/x-charts";
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HistoricoDTO } from "../../../dtos/historico/historicoDTO";
import { DASH, SIMULADO_HISTORIES } from "../../../routes/path";
import { categoriaDoHistorico } from "../../../utils/categoriaDoHistorico";
import { foiPorCartao } from "../../../utils/foiPorCartao";
import { getFormatingTime } from "../../../utils/getFormatingTime";
import { RadarChart } from "../../atoms/radarChart";
import { useAcimaDeSm } from "../../dashV2/useAcimaDeSm";

// O rótulo do Chip não quebra linha: no celular o nome da frente saía com "…".
const chipQuebraLinha = {
  height: "auto",
  "& .MuiChip-label": { whiteSpace: "normal", py: 0.75 },
};

interface SimulationHistoryHeaderProps {
  historic: HistoricoDTO;
}

export function SimulationHistoryHeader({
  historic,
}: SimulationHistoryHeaderProps) {
  const navigate = useNavigate();
  // Estado para controlar visualização por matéria ou frente
  const [viewMode, setViewMode] = useState<"materias" | "frentes">("materias");
  // Abaixo de 768px (o `sm` do projeto): pizza responsiva e frentes em barras.
  const acimaDeSm = useAcimaDeSm();
  const pad = acimaDeSm ? 3 : 2;

  const categoria = categoriaDoHistorico(historic);
  // Cartão-resposta não cronometra: sem o card de tempo, os 3 restantes
  // dividem a linha (e no celular o 3º ocupa a linha toda).
  const porCartao = foiPorCartao(historic);
  const mdDoCard = porCartao ? 4 : 3;
  const finished =
    categoria.totalQuestoes !== null &&
    categoria.totalQuestoes === historic.questoesRespondidas;

  if (!historic.aproveitamento) {
    const isFailed = historic.status === "failed";
    return (
      // ⚠️ Aqui o cabeçalho é desenhado fora do `SimulateTemplate`, que é quem
      // dá o fundo marinho: sem ele o título branco sumia no fundo claro.
      <Box className="bg-marine" sx={{ p: pad, minHeight: "100vh" }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 3,
          }}
        >
          <Typography
            variant={acimaDeSm ? "h4" : "h5"}
            sx={{
              color: "white",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
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
        <Paper
          elevation={3}
          sx={{
            p: acimaDeSm ? 4 : 2,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          {isFailed ? (
            <XCircle className="h-16 w-16 text-red-500" />
          ) : (
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
          )}
          <Typography
            variant="h5"
            fontWeight="bold"
            color={isFailed ? "error" : "primary"}
          >
            {isFailed
              ? "Erro ao processar simulado"
              : "Processando resultados..."}
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            {isFailed
              ? "Ocorreu um erro ao calcular seu aproveitamento. Por favor, tente novamente mais tarde ou entre em contato com o suporte."
              : "Seu simulado está sendo processado. Os resultados estarão disponíveis em breve."}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {categoria.nome} — {historic.questoesRespondidas} de{" "}
            {categoria.totalQuestoes ?? 0} questões respondidas
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Prepara dados do Radar por MATÉRIAS
  const radarDataMaterias = (historic.aproveitamento?.materias ?? []).map(
    (m) => ({
      materia: m.nome,
      aproveitamento: parseFloat((m.aproveitamento * 100).toFixed(1)),
    }),
  );

  // Prepara dados do Radar por FRENTES
  const radarDataFrente = (historic.aproveitamento?.materias ?? []).flatMap(
    (materia) =>
      materia.frentes.map((frente) => ({
        materia: `${materia.nome} - ${frente.nome}`,
        aproveitamento: parseFloat((frente.aproveitamento * 100).toFixed(1)),
        materiaNome: materia.nome,
        frenteNome: frente.nome,
      })),
  );

  // Seleciona os dados baseado no modo de visualização
  const radarData =
    viewMode === "frentes" ? radarDataFrente : radarDataMaterias;

  // Prepara dados do Pie (acertos/erros)
  const acertos = historic.respostas.filter(
    (r) => r.alternativaCorreta === r.alternativaEstudante,
  ).length;

  const erros = historic.respostas.filter(
    (r) =>
      r.alternativaEstudante !== undefined &&
      r.alternativaCorreta !== r.alternativaEstudante,
  ).length;

  const naoRespondidas = historic.respostas.filter(
    (r) => r.alternativaEstudante === undefined,
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

  const aproveitamentoGeral = (
    (historic.aproveitamento?.geral ?? 0) * 100
  ).toFixed(1);
  const totalQuestoes = categoria.totalQuestoes ?? 0;
  const percentualAcertos =
    totalQuestoes > 0 ? ((acertos / totalQuestoes) * 100).toFixed(1) : "0.0";
  const percentualErros =
    totalQuestoes > 0 ? ((erros / totalQuestoes) * 100).toFixed(1) : "0.0";

  // Encontra melhor e pior (baseado no modo de visualização)
  const melhor = radarData.reduce((prev, current) =>
    prev.aproveitamento > current.aproveitamento ? prev : current,
  );
  const pior = radarData.reduce((prev, current) =>
    prev.aproveitamento < current.aproveitamento ? prev : current,
  );

  // Função para determinar a cor da barra baseado no aproveitamento
  const getProgressColor = (aproveitamento: number) => {
    if (aproveitamento >= 70) return "success";
    if (aproveitamento >= 50) return "warning";
    return "error";
  };

  // Chamada como `{barras()}`, não `<Barras />`: declarada no render, viraria
  // um componente novo a cada render (ver semComponenteNoRender.test.ts).
  const barras = () => (
    <Box sx={{ mt: 0 }}>
      <Typography
        variant="subtitle2"
        fontWeight="bold"
        sx={{ mb: 2, color: "text.secondary" }}
      >
        📊 Aproveitamento por {viewMode === "frentes" ? "Frente" : "Matéria"}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxHeight: "500px",
          overflowY: "auto",
          pr: 1,
        }}
      >
        {[...radarData]
          .sort((a, b) => b.aproveitamento - a.aproveitamento)
          .map((item, index) => (
            <Box key={index}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  {item.materia}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={
                    item.aproveitamento >= 70
                      ? "success.main"
                      : item.aproveitamento >= 50
                        ? "warning.main"
                        : "error.main"
                  }
                >
                  {item.aproveitamento.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={item.aproveitamento}
                color={getProgressColor(item.aproveitamento)}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                }}
              />
            </Box>
          ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: pad, minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography
          variant={acimaDeSm ? "h4" : "h5"}
          sx={{
            color: "white",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
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
          p: pad,
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
              {categoria.nome} - {historic.ano}
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
      <Grid container spacing={acimaDeSm ? 2 : 1.5} sx={{ mb: 3 }}>
        <Grid item xs={6} md={mdDoCard}>
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

        <Grid item xs={6} md={mdDoCard}>
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

        <Grid item xs={porCartao ? 12 : 6} md={mdDoCard}>
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

        {!porCartao && (
          <Grid item xs={6} md={3}>
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
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
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
        )}
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={acimaDeSm ? 3 : 2}>
        {/* Radar Chart - Aproveitamento por Matéria/Frente */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: pad, borderRadius: 2, height: "100%" }}>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Target className="h-5 w-5" />
                Desempenho por {viewMode === "frentes" ? "Frente" : "Matéria"}
              </Typography>

              {/* Toggle Button */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant={viewMode === "materias" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("materias")}
                  className="transition-all"
                >
                  📚 Matérias
                </Button>
                <Button
                  variant={viewMode === "frentes" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("frentes")}
                  className="transition-all"
                >
                  🎯 Frentes
                </Button>
              </Box>
            </Box>

            {/* Descrição explicativa */}
            <Typography
              variant="body2"
              sx={{ mb: 2, color: "text.secondary", fontStyle: "italic" }}
            >
              {viewMode === "frentes"
                ? "Visualizando o aproveitamento detalhado por cada frente de estudo dentro das matérias"
                : "Visualizando o aproveitamento geral por matéria"}
            </Typography>

            {/* Modo Frentes: Radar no desktop; no celular os rótulos
                "Matéria - Frente" saíam cortados, então vira barras. */}
            {viewMode === "frentes" && (
              <>
                {!acimaDeSm && barras()}
                {acimaDeSm && (
                  <Box sx={{ height: 400 }}>
                    <RadarChart
                      data={radarData}
                      scheme="category10"
                      fill="#374151"
                      dotSize={12}
                      dotBorderWidth={4}
                    />
                  </Box>
                )}

                {/* Insights */}
                <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Chip
                    icon={<TrendingUp className="h-4 w-4" />}
                    label={`Melhor: ${
                      melhor.materia
                    } (${melhor.aproveitamento.toFixed(1)}%)`}
                    color="success"
                    variant="outlined"
                    sx={chipQuebraLinha}
                  />
                  <Chip
                    icon={<AlertCircle className="h-4 w-4" />}
                    label={`Precisa melhorar: ${
                      pior.materia
                    } (${pior.aproveitamento.toFixed(1)}%)`}
                    color="warning"
                    variant="outlined"
                    sx={chipQuebraLinha}
                  />
                </Box>
              </>
            )}

            {/* Modo Matérias: Exibe APENAS Barras de Progresso */}
            {viewMode === "materias" && barras()}
          </Paper>
        </Grid>

        {/* Pie Chart - Distribuição de Respostas */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: pad, borderRadius: 2, height: "100%" }}>
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
                height: acimaDeSm ? 400 : 300,
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
                    innerRadius: acimaDeSm ? 50 : 40,
                    outerRadius: acimaDeSm ? 120 : 95,
                    paddingAngle: 2,
                    cornerRadius: 5,
                    arcLabel: (item) => `${item.value}`,
                    arcLabelMinAngle: 20,
                  },
                ]}
                // No celular sem largura fixa (400px passavam da tela) e com a
                // legenda embaixo.
                width={acimaDeSm ? 400 : undefined}
                height={acimaDeSm ? 400 : 300}
                margin={
                  acimaDeSm
                    ? undefined
                    : { top: 0, right: 0, left: 0, bottom: 50 }
                }
                slotProps={{
                  legend: acimaDeSm
                    ? {
                        direction: "column",
                        position: { vertical: "middle", horizontal: "right" },
                        padding: -30,
                        itemMarkWidth: 6,
                        itemMarkHeight: 15,
                        markGap: 8,
                        itemGap: 8,
                      }
                    : {
                        direction: "row",
                        position: { vertical: "bottom", horizontal: "middle" },
                        padding: 0,
                        itemMarkWidth: 10,
                        itemMarkHeight: 10,
                        markGap: 4,
                        itemGap: 10,
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
