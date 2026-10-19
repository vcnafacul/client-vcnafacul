import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/pages/dashboard/components/ChartTooltip";
import { EmptyState, Panel } from "@/pages/dashboard/components/Panel";
import { Segmented } from "@/pages/dashboard/components/Segmented";
import { chartColors } from "@/pages/dashboard/theme";
import {
  contagem,
  type IndicadoresDeTodos,
  type Metricas,
} from "@/services/indicadores";
import { evasao, frequencia } from "./formato";

interface Medida {
  chave: string;
  rotulo: string;
  legenda: string;
  porcentagem?: boolean;
  valor: (m: Metricas) => number | null;
}

const MEDIDAS: Medida[] = [
  {
    chave: "alunos",
    rotulo: "Alunos",
    legenda: "alunos no período",
    valor: (m) => contagem(m, "alunos"),
  },
  {
    chave: "evasao",
    rotulo: "Evasão",
    legenda: "de evasão",
    porcentagem: true,
    valor: (m) => evasao(m),
  },
  {
    chave: "frequencia",
    rotulo: "Frequência",
    legenda: "de frequência média",
    porcentagem: true,
    valor: (m) =>
      contagem(m, "aulasRegistradas") === 0 ? null : frequencia(m),
  },
];

/**
 * tickets/046, D3 — na visão de todos os períodos, uma barra por período no
 * lugar da série semanal (somar anos diferentes não diria nada).
 */
export function ComparativoEntrePeriodos({
  comparativo,
}: {
  comparativo: IndicadoresDeTodos["comparativo"];
}) {
  const [chave, setChave] = useState(MEDIDAS[0].chave);
  const medida = MEDIDAS.find((m) => m.chave === chave) ?? MEDIDAS[0];
  const barras = comparativo.map((p) => ({
    nome: p.nome,
    emAndamento: p.emAndamento,
    valor: medida.valor(p.metricas),
  }));
  const fmt = (v: number) =>
    medida.porcentagem ? `${v.toLocaleString("pt-BR")}%` : String(v);

  return (
    <Panel
      title="Comparativo entre períodos"
      subtitle="Uma barra por período letivo"
      action={
        <Segmented
          label="Indicador do gráfico"
          options={MEDIDAS.map((m) => ({ value: m.chave, label: m.rotulo }))}
          value={chave}
          onChange={setChave}
        />
      }
    >
      {comparativo.length === 0 ? (
        <EmptyState>Nenhum período letivo cadastrado.</EmptyState>
      ) : (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barras}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke={chartColors.grid} />
              <XAxis
                dataKey="nome"
                tickLine={false}
                axisLine={false}
                tick={{ fill: chartColors.axis, fontSize: 12 }}
                tickMargin={8}
                interval={0}
                tickFormatter={(n: string) =>
                  n.length > 14 ? `${n.slice(0, 13)}…` : n
                }
              />
              <YAxis
                allowDecimals={false}
                tickFormatter={(v) => fmt(v)}
                tickLine={false}
                axisLine={false}
                tick={{ fill: chartColors.axis, fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: chartColors.grid, opacity: 0.4 }}
                content={({ active, payload }) => {
                  const b = payload?.[0]?.payload as
                    | (typeof barras)[number]
                    | undefined;
                  if (!active || !b) return null;
                  return (
                    <ChartTooltip
                      title={b.nome + (b.emAndamento ? " · em andamento" : "")}
                    >
                      {b.valor === null ? (
                        "sem dados"
                      ) : (
                        <>
                          <strong className="tabular-nums lining-nums">
                            {fmt(b.valor)}
                          </strong>{" "}
                          {medida.legenda}
                        </>
                      )}
                    </ChartTooltip>
                  );
                }}
              />
              <Bar
                dataKey="valor"
                fill={chartColors.primary}
                radius={[4, 4, 0, 0]}
                maxBarSize={56}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}
