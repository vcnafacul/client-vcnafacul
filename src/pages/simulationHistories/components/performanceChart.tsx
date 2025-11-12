import { formatDate } from "@/utils/date";
import { Box, Chip, Paper, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import { AproveitamentoHitoriesDTO } from "../../../dtos/historico/getPerformanceDTO";

interface PerformanceChartProps {
  aproveitamento: AproveitamentoHitoriesDTO;
}

export function PerformanceChart({ aproveitamento }: PerformanceChartProps) {
  if (!aproveitamento || aproveitamento.historicos.length === 0) {
    return null;
  }

  // Prepara os dados para o gráfico
  // pega os ultimos 10 simulados
  const historicos = aproveitamento.historicos.slice(0, 10).reverse();
  const xAxisData = historicos.map((h) =>
    formatDate(h.createdAt.toString(), "dd/MM/yyyy HH:mm")
  );
  const performanceData = historicos.map((h) => h.performance.geral * 100);
  // Calcula estatísticas
  const mediaGeral =
    performanceData.reduce((sum, val) => sum + val, 0) / performanceData.length;
  const melhorDesempenho = Math.max(...performanceData);
  const piorDesempenho = Math.min(...performanceData);

  // Verifica tendência (compara últimos 2 com primeiros 2 simulados)
  const inicio =
    historicos.length >= 2
      ? (historicos[0].performance.geral + historicos[1].performance.geral) / 2
      : historicos[0].performance.geral;

  const fim =
    historicos.length >= 2
      ? (historicos[historicos.length - 1].performance.geral +
          historicos[historicos.length - 2].performance.geral) /
        2
      : historicos[historicos.length - 1].performance.geral;

  const tendencia =
    fim > inicio ? "crescente" : fim < inicio ? "decrescente" : "estável";

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 3,
        background: "linear-gradient(135deg, #052e16 0%, #09090b 100%)",
        color: "white",
        borderRadius: 2,
      }}
    >
      {/* Título e Estatísticas */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Activity className="h-6 w-6" />
          <Typography variant="h5" fontWeight="bold">
            Evolução do Desempenho
          </Typography>
        </Box>

        {/* Cards de Estatísticas */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            mb: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              p: 2,
              borderRadius: 2,
              flex: "1 1 200px",
              minWidth: "150px",
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Pior Desempenho
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="#4ade80">
              {piorDesempenho.toFixed(1)}%
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              p: 2,
              borderRadius: 2,
              flex: "1 1 200px",
              minWidth: "150px",
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Melhor Desempenho
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="#4ade80">
              {melhorDesempenho.toFixed(1)}%
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              p: 2,
              borderRadius: 2,
              flex: "1 1 200px",
              minWidth: "150px",
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Média Geral
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {mediaGeral.toFixed(1)}%
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              p: 2,
              borderRadius: 2,
              flex: "1 1 200px",
              minWidth: "150px",
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Total de Simulados
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {historicos.length}
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              p: 2,
              borderRadius: 2,
              flex: "1 1 200px",
              minWidth: "150px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.9, mb: 0.5 }}>
              Tendência
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {tendencia === "crescente" ? (
                <>
                  <TrendingUp className="h-6 w-6" color="#4ade80" />
                  <Typography variant="body1" fontWeight="bold" color="#4ade80">
                    Crescente
                  </Typography>
                </>
              ) : tendencia === "decrescente" ? (
                <>
                  <TrendingDown className="h-6 w-6" color="#f87171" />
                  <Typography variant="body1" fontWeight="bold" color="#f87171">
                    Decrescente
                  </Typography>
                </>
              ) : (
                <>
                  <Activity className="h-6 w-6" color="#fbbf24" />
                  <Typography variant="body1" fontWeight="bold" color="#fbbf24">
                    Estável
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Gráfico */}
      <Box
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 2,
          p: 2,
          height: 400,
        }}
      >
        <LineChart
          xAxis={[
            {
              data: xAxisData,
              scaleType: "point",
              label: "Data do Simulado",
              labelStyle: {
                fill: "#64748b",
                fontSize: 12,
                fontWeight: "bold",
              },
              tickLabelStyle: {
                angle: -15,
                textAnchor: "end",
                fontSize: 11,
                fill: "#64748b",
              },
            },
          ]}
          yAxis={[
            {
              label: "Aproveitamento (%)",
              min: 0,
              max: 100,
              labelStyle: {
                fill: "#64748b",
                fontSize: 12,
                fontWeight: "bold",
              },
              tickLabelStyle: {
                fontSize: 11,
                fill: "#64748b",
              },
            },
          ]}
          series={[
            {
              data: performanceData,
              label: "Desempenho",
              color: "#667eea",
              curve: "monotoneX",
              showMark: true,
              area: true,
              valueFormatter: (value) =>
                value != null ? `${value.toFixed(1)}%` : "",
            },
          ]}
          width={undefined}
          height={undefined}
          margin={{
            left: 70,
            right: 30,
            top: 40,
            bottom: 80,
          }}
          grid={{ vertical: true, horizontal: true }}
          slotProps={{
            legend: {
              position: { vertical: "top", horizontal: "right" },
              padding: 0,
              labelStyle: {
                fontSize: 12,
                fill: "#64748b",
                fontWeight: "bold",
              },
            },
          }}
          sx={{
            "& .MuiLineElement-root": {
              strokeWidth: 3,
            },
            "& .MuiMarkElement-root": {
              scale: "1.2",
              fill: "white",
              strokeWidth: 2,
            },
            "& .MuiAreaElement-root": {
              fillOpacity: 0.3,
            },
          }}
        />
      </Box>

      {/* Dicas de Melhoria */}
      {mediaGeral < 70 && (
        <Box sx={{ mt: 2 }}>
          <Chip
            icon={<TrendingUp className="h-4 w-4" />}
            label="💡 Dica: Continue praticando! A consistência é a chave para melhorar seu desempenho."
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: "bold",
              "& .MuiChip-icon": {
                color: "white",
              },
            }}
          />
        </Box>
      )}
      {mediaGeral >= 70 && mediaGeral < 85 && (
        <Box sx={{ mt: 2 }}>
          <Chip
            icon={<Activity className="h-4 w-4" />}
            label="🎯 Muito bem! Você está no caminho certo. Continue se desafiando!"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: "bold",
              "& .MuiChip-icon": {
                color: "white",
              },
            }}
          />
        </Box>
      )}
      {mediaGeral >= 85 && (
        <Box sx={{ mt: 2 }}>
          <Chip
            icon={<TrendingUp className="h-4 w-4" />}
            label="🏆 Excelente! Seu desempenho está acima da média. Continue assim!"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: "bold",
              "& .MuiChip-icon": {
                color: "white",
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
}
