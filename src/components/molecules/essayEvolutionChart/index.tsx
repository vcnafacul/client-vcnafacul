import { LineChart } from "@mui/x-charts/LineChart";
import type { ClassEssayMonthsList } from "@/types/classAnalytics/classEssayAnalytics";

interface Props {
  months: ClassEssayMonthsList["months"];
  selectedMonth: string | null;
  onSelectMonth: (month: string) => void;
}

function formatMonth(yyyymm: string) {
  const [y, m] = yyyymm.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date
    .toLocaleString("pt-BR", { month: "short", year: "2-digit" })
    .replace(".", "");
}

const norm = (v: number, max: number) =>
  Math.round((v / max) * 100 * 10) / 10;

export function EssayEvolutionChart({
  months,
  selectedMonth,
  onSelectMonth,
}: Props) {
  if (months.length === 0) return null;

  const ordered = [...months].sort((a, b) => a.month.localeCompare(b.month));
  const labels = ordered.map((m) => formatMonth(m.month));
  const selectedIndex = ordered.findIndex((m) => m.month === selectedMonth);

  const seriesDefs = [
    {
      id: "geral",
      label: "Geral",
      max: 1000,
      values: ordered.map((m) => m.geral),
    },
    {
      id: "c1",
      label: "C1 — Norma",
      max: 200,
      values: ordered.map((m) => m.competencias.c1),
    },
    {
      id: "c2",
      label: "C2 — Tema",
      max: 200,
      values: ordered.map((m) => m.competencias.c2),
    },
    {
      id: "c3",
      label: "C3 — Argumentação",
      max: 200,
      values: ordered.map((m) => m.competencias.c3),
    },
    {
      id: "c4",
      label: "C4 — Coesão",
      max: 200,
      values: ordered.map((m) => m.competencias.c4),
    },
    {
      id: "c5",
      label: "C5 — Proposta",
      max: 200,
      values: ordered.map((m) => m.competencias.c5),
    },
  ];

  const series = seriesDefs.map(({ id, label, max, values }) => ({
    id,
    label,
    data: values.map((v) => norm(v, max)),
    showMark: true,
    valueFormatter: (
      _normalizedValue: number | null,
      context: { dataIndex: number }
    ) => {
      const abs = values[context.dataIndex];
      return `${abs} / ${max}`;
    },
  }));

  return (
    <div
      className="w-full"
      aria-label="Evolução do desempenho em redação por mês"
    >
      <h3 className="text-base font-semibold mb-2">
        Evolução por mês (% do máximo)
      </h3>
      <LineChart
        height={280}
        xAxis={[{ data: labels, scaleType: "point" }]}
        yAxis={[{ min: 0, max: 100 }]}
        series={series}
        margin={{ left: 40, right: 16, top: 16, bottom: 32 }}
        onAreaClick={(_, params) => {
          const idx = params?.dataIndex;
          if (idx != null && ordered[idx]) onSelectMonth(ordered[idx].month);
        }}
        onMarkClick={(_, params) => {
          const idx = params?.dataIndex;
          if (idx != null && ordered[idx]) onSelectMonth(ordered[idx].month);
        }}
      />
      {selectedIndex >= 0 && (
        <p className="text-sm text-gray-500">
          Mês selecionado: {labels[selectedIndex]}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Valores normalizados em % do máximo (Geral 0–1000, C1–C5 0–200).
        Tooltip mostra a nota absoluta.
      </p>
    </div>
  );
}
