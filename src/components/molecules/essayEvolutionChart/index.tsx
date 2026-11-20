import { LineChart } from "@mui/x-charts/LineChart";
import type { ClassEssayMonthsList } from "@/types/classAnalytics/classEssayAnalytics";
import { palette } from "@/lib/palette";

interface Props {
  months: ClassEssayMonthsList["months"];
  selectedMonth: string | null;
  onSelectMonth: (month: string) => void;
}

function formatMonth(yyyymm: string) {
  const [y, m] = yyyymm.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date
    .toLocaleString("pt-BR", { month: "short" })
    .replace(".", "");
}

interface MiniLineProps {
  id: string;
  label: string;
  color: string;
  max: number;
  values: number[];
  labels: string[];
  months: string[];
  height: number;
  onSelectMonth: (month: string) => void;
  tickInterval?: number[];
  showGrid?: boolean;
}

function MiniLine({
  id,
  label,
  color,
  max,
  values,
  labels,
  months,
  height,
  onSelectMonth,
  tickInterval,
  showGrid,
}: MiniLineProps) {
  return (
    <div className="border rounded-md p-3 bg-white">
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <h4 className="text-body font-medium text-foreground">{label}</h4>
      </div>
      <LineChart
        height={height}
        xAxis={[{ data: labels, scaleType: "point" }]}
        yAxis={[
          tickInterval
            ? { min: 0, max, tickInterval }
            : { min: 0, max },
        ]}
        series={[
          {
            id,
            label,
            color,
            data: values,
            showMark: true,
            valueFormatter: (
              v: number | null,
              context: { dataIndex: number }
            ) => `${v ?? values[context.dataIndex]} / ${max}`,
          },
        ]}
        margin={{ left: 36, right: 12, top: 8, bottom: 28 }}
        slotProps={{ legend: { hidden: true } }}
        grid={showGrid ? { horizontal: true } : undefined}
        sx={
          showGrid
            ? {
                "& .MuiChartsGrid-line": {
                  strokeDasharray: "3 3",
                  stroke: palette.neutral[200],
                },
              }
            : undefined
        }
        onAreaClick={(_, params) => {
          const idx = params?.dataIndex;
          if (idx != null && months[idx]) onSelectMonth(months[idx]);
        }}
        onMarkClick={(_, params) => {
          const idx = params?.dataIndex;
          if (idx != null && months[idx]) onSelectMonth(months[idx]);
        }}
      />
    </div>
  );
}

export function EssayEvolutionChart({
  months,
  selectedMonth,
  onSelectMonth,
}: Props) {
  if (months.length === 0) return null;

  const ordered = [...months].sort((a, b) => a.month.localeCompare(b.month));
  const labels = ordered.map((m) => formatMonth(m.month));
  const monthKeys = ordered.map((m) => m.month);
  const selectedIndex = ordered.findIndex((m) => m.month === selectedMonth);

  const charts = [
    {
      id: "geral",
      label: "Geral",
      color: palette.mint[500],
      max: 1000,
      tickInterval: [0, 200, 400, 600, 800, 1000],
      values: ordered.map((m) => m.geral),
    },
    {
      id: "c1",
      label: "C1 — Norma",
      color: palette.blue[500],
      max: 200,
      tickInterval: [0, 40, 80, 120, 160, 200],
      values: ordered.map((m) => m.competencias.c1),
    },
    {
      id: "c2",
      label: "C2 — Tema",
      color: palette.pink[600],
      max: 200,
      tickInterval: [0, 40, 80, 120, 160, 200],
      values: ordered.map((m) => m.competencias.c2),
    },
    {
      id: "c3",
      label: "C3 — Argumentação",
      color: palette.marine[700],
      max: 200,
      tickInterval: [0, 40, 80, 120, 160, 200],
      values: ordered.map((m) => m.competencias.c3),
    },
    {
      id: "c4",
      label: "C4 — Coesão",
      color: palette.blue[600],
      max: 200,
      tickInterval: [0, 40, 80, 120, 160, 200],
      values: ordered.map((m) => m.competencias.c4),
    },
    {
      id: "c5",
      label: "C5 — Proposta",
      color: palette.blue[800],
      max: 200,
      tickInterval: [0, 40, 80, 120, 160, 200],
      values: ordered.map((m) => m.competencias.c5),
    },
  ];

  return (
    <div
      className="w-full"
      aria-label="Evolução do desempenho em redação por mês"
    >
      <h3 className="text-body font-semibold mb-2">Evolução por mês</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {charts.map((c) => (
          <MiniLine
            key={c.id}
            id={c.id}
            label={c.label}
            color={c.color}
            max={c.max}
            values={c.values}
            labels={labels}
            months={monthKeys}
            height={160}
            onSelectMonth={onSelectMonth}
            tickInterval={c.tickInterval}
            showGrid
          />
        ))}
      </div>
      {selectedIndex >= 0 && (
        <p className="text-body text-muted-foreground mt-3">
          Mês selecionado: {labels[selectedIndex]}
          {ordered[selectedIndex].studentsSubmittedTotal !== null && (
            <span className="text-muted-foreground">
              {" "}
              · n={ordered[selectedIndex].studentsSubmittedTotal} aluno
              {ordered[selectedIndex].studentsSubmittedTotal === 1 ? "" : "s"}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
