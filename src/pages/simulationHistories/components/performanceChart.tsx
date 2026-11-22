import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { formatDate } from "@/utils/date";
import { LineChart } from "@mui/x-charts";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import { AproveitamentoHitoriesDTO } from "../../../dtos/historico/getPerformanceDTO";
import { palette } from "@/lib/palette";
import { Card } from "@/components/ui/card";

interface PerformanceChartProps {
  aproveitamento: AproveitamentoHitoriesDTO;
  /** Total real de simulados feitos; o gráfico só considera os últimos 10. */
  totalSimulados?: number;
}

const ULTIMOS = 10;

const cartaoEstatistica =
  "rounded-lg bg-white/20 backdrop-blur-md p-3 sm:p-4 min-w-0 sm:min-w-[150px] sm:flex-[1_1_200px]";

function Estatistica({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cartaoEstatistica}>
      <span className="text-caption opacity-90">{rotulo}</span>
      {children}
    </div>
  );
}

function Dica({
  icone,
  children,
}: {
  icone: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <p className="inline-flex items-start gap-2 rounded-full bg-white/20 px-3 py-2 text-body-sm font-bold text-white">
        {icone}
        <span>{children}</span>
      </p>
    </div>
  );
}

export function PerformanceChart({
  aproveitamento,
  totalSimulados,
}: PerformanceChartProps) {
  // Abaixo de 768px (o `sm` do projeto): eixo curto, indicadores 2 por linha.
  const acimaDeSm = useAcimaDeSm();

  if (!aproveitamento || aproveitamento.historicos.length === 0) {
    return null;
  }

  // Prepara os dados para o gráfico
  // pega os ultimos 10 simulados
  const historicos = aproveitamento.historicos.slice(0, ULTIMOS).reverse();
  const xAxisData = historicos.map((h) =>
    formatDate(h.createdAt.toString(), "dd/MM/yyyy HH:mm:ss"),
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
    <Card
      className="mb-6 border-0 p-4 sm:p-6 text-white"
      style={{
        background: `linear-gradient(135deg, ${palette.marine[900]} 0%, ${palette.neutral[950]} 100%)`,
      }}
    >
      {/* Título e Estatísticas */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-6 w-6" aria-hidden="true" />
          <h2 className="text-h2 font-bold">Evolução do Desempenho</h2>
        </div>

        {/* Cards de Estatísticas */}
        <p className="text-caption block opacity-80 mb-3">
          Estatísticas dos últimos {historicos.length} simulados
        </p>
        {/* No celular 2 por linha: um por linha eram ~450px antes do gráfico. */}
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4 mb-4">
          <Estatistica rotulo="Pior Desempenho">
            <p
              className="text-h1 font-bold"
              style={{ color: palette.red[400] }}
            >
              {piorDesempenho.toFixed(1)}%
            </p>
          </Estatistica>

          <Estatistica rotulo="Melhor Desempenho">
            <p
              className="text-h1 font-bold"
              style={{ color: palette.mint[400] }}
            >
              {melhorDesempenho.toFixed(1)}%
            </p>
          </Estatistica>

          <Estatistica rotulo="Média Geral">
            <p className="text-h1 font-bold">{mediaGeral.toFixed(1)}%</p>
          </Estatistica>

          <Estatistica rotulo="Total de Simulados">
            <p className="text-h1 font-bold">
              {totalSimulados ?? aproveitamento.historicos.length}
            </p>
          </Estatistica>

          <div
            className={`${cartaoEstatistica} col-span-2 sm:col-span-1 flex flex-col justify-center`}
          >
            <span className="text-caption opacity-90 mb-1">Tendência</span>
            <div className="flex items-center gap-2">
              {tendencia === "crescente" ? (
                <>
                  <TrendingUp
                    className="h-6 w-6"
                    color={palette.mint[400]}
                    aria-hidden="true"
                  />
                  <p
                    className="text-body font-bold"
                    style={{ color: palette.mint[400] }}
                  >
                    Crescente
                  </p>
                </>
              ) : tendencia === "decrescente" ? (
                <>
                  <TrendingDown
                    className="h-6 w-6"
                    color={palette.red[400]}
                    aria-hidden="true"
                  />
                  <p
                    className="text-body font-bold"
                    style={{ color: palette.red[400] }}
                  >
                    Decrescente
                  </p>
                </>
              ) : (
                <>
                  <Activity
                    className="h-6 w-6"
                    color={palette.yellow[400]}
                    aria-hidden="true"
                  />
                  <p
                    className="text-body font-bold"
                    style={{ color: palette.yellow[400] }}
                  >
                    Estável
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div
        className="rounded-lg bg-white/95 p-2 sm:p-4"
        style={{ height: acimaDeSm ? 400 : 280 }}
      >
        <LineChart
          xAxis={[
            {
              data: xAxisData,
              scaleType: "point",
              // O dado segue com a hora: dois simulados no mesmo dia viram um
              // ponto só numa escala de pontos se o valor repetir.
              valueFormatter: (value: string, context) =>
                !acimaDeSm && context.location === "tick"
                  ? value.slice(0, 5)
                  : value,
              label: acimaDeSm ? "Data do Simulado" : undefined,
              labelStyle: {
                fill: palette.neutral[600],
                fontSize: 12,
                fontWeight: "bold",
              },
              tickLabelStyle: {
                angle: -15,
                textAnchor: "end",
                fontSize: 11,
                fill: palette.neutral[600],
              },
            },
          ]}
          yAxis={[
            {
              label: acimaDeSm ? "Aproveitamento (%)" : undefined,
              min: 0,
              max: 100,
              labelStyle: {
                fill: palette.neutral[600],
                fontSize: 12,
                fontWeight: "bold",
              },
              tickLabelStyle: {
                fontSize: 11,
                fill: palette.neutral[600],
              },
            },
          ]}
          series={[
            {
              data: performanceData,
              label: "Desempenho",
              color: palette.marine[700],
              curve: "monotoneX",
              showMark: true,
              area: true,
              valueFormatter: (value) =>
                value != null ? `${value.toFixed(1)}%` : "",
            },
          ]}
          width={undefined}
          height={undefined}
          margin={
            acimaDeSm
              ? { left: 70, right: 30, top: 40, bottom: 80 }
              : { left: 40, right: 12, top: 40, bottom: 40 }
          }
          grid={{ vertical: true, horizontal: true }}
          slotProps={{
            legend: {
              position: { vertical: "top", horizontal: "right" },
              padding: 0,
              labelStyle: {
                fontSize: 12,
                fill: palette.neutral[600],
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
      </div>

      {/* Dicas de Melhoria */}
      {mediaGeral < 70 && (
        <Dica
          icone={
            <TrendingUp
              className="h-4 w-4 shrink-0 mt-0.5"
              aria-hidden="true"
            />
          }
        >
          💡 Dica: Continue praticando! A consistência é a chave para melhorar
          seu desempenho.
        </Dica>
      )}
      {mediaGeral >= 70 && mediaGeral < 85 && (
        <Dica
          icone={
            <Activity className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          }
        >
          🎯 Muito bem! Você está no caminho certo. Continue se desafiando!
        </Dica>
      )}
      {mediaGeral >= 85 && (
        <Dica
          icone={
            <TrendingUp
              className="h-4 w-4 shrink-0 mt-0.5"
              aria-hidden="true"
            />
          }
        >
          🏆 Excelente! Seu desempenho está acima da média. Continue assim!
        </Dica>
      )}
    </Card>
  );
}
