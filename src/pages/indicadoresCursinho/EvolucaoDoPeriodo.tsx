import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/pages/dashboard/components/ChartTooltip";
import { EmptyState, Panel } from "@/pages/dashboard/components/Panel";
import { Segmented } from "@/pages/dashboard/components/Segmented";
import { chartColors } from "@/pages/dashboard/theme";
import type { Indicadores, Metricas } from "@/services/indicadores";
import { pontosSemanais } from "./serie";

export interface CurvaDoPeriodo {
  chave: string;
  rotulo: string;
  /** Texto do tooltip depois do valor ("alunos ativos"). */
  legenda: string;
  porcentagem?: boolean;
  valor: (m: Metricas) => number | null;
  /** Valor da semana (e não acumulado) — ver `pontosSemanais`. */
  daSemana?: (atual: Metricas, anterior: Metricas | undefined) => number | null;
}

interface Props {
  serie: Indicadores["serie"];
  curvas: CurvaDoPeriodo[];
}

/**
 * Como os números andaram ao longo do período, semana a semana, a partir das
 * fotos diárias (tickets/033). Cada card que tem uma curva entra em `curvas`;
 * com mais de uma, aparece o seletor.
 */
export function EvolucaoDoPeriodo({ serie, curvas }: Props) {
  const [chave, setChave] = useState(curvas[0].chave);
  const curva = curvas.find((c) => c.chave === chave) ?? curvas[0];
  const pontos = pontosSemanais(serie, curva.valor, curva.daSemana);
  const comDado = pontos.filter((p) => p.valor !== null);
  const fmt = (v: number) =>
    curva.porcentagem ? `${v.toLocaleString("pt-BR")}%` : String(v);

  return (
    <Panel
      title="Ao longo do período"
      subtitle="Um ponto por semana"
      action={
        curvas.length > 1 && (
          <Segmented
            label="Indicador do gráfico"
            options={curvas.map((c) => ({ value: c.chave, label: c.rotulo }))}
            value={chave}
            onChange={setChave}
          />
        )
      }
    >
      {comDado.length < 2 ? (
        <EmptyState>
          O gráfico aparece a partir da segunda semana com números deste
          período.
        </EmptyState>
      ) : (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={pontos}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke={chartColors.grid} />
              <XAxis
                dataKey="rotulo"
                tickLine={false}
                axisLine={false}
                tick={{ fill: chartColors.axis, fontSize: 12 }}
                tickMargin={8}
                minTickGap={16}
              />
              <YAxis
                allowDecimals={false}
                tickFormatter={(v) => fmt(v)}
                tickLine={false}
                axisLine={false}
                tick={{ fill: chartColors.axis, fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: chartColors.grid }}
                content={({ active, payload }) => {
                  const p = payload?.[0]?.payload as
                    | (typeof pontos)[number]
                    | undefined;
                  if (!active || !p || p.valor === null) return null;
                  return (
                    <ChartTooltip title={`Semana até ${p.rotulo}`}>
                      <strong className="tabular-nums lining-nums">
                        {fmt(p.valor)}
                      </strong>{" "}
                      {curva.legenda}
                    </ChartTooltip>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={chartColors.primary}
                strokeWidth={2}
                dot={{ r: 3, fill: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}
