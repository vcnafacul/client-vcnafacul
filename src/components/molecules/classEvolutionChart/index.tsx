import { LineChart } from "@mui/x-charts/LineChart";
import { ClassMonthsList } from "@/types/classAnalytics/classSimuladoAnalytics";

interface Props {
  months: ClassMonthsList["months"];
  selectedMonth: string | null;
  onSelectMonth: (month: string) => void;
}

function formatMonth(yyyymm: string) {
  const [y, m] = yyyymm.split("-");
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
  return date
    .toLocaleString("pt-BR", { month: "short", year: "2-digit" })
    .replace(".", "");
}

export function ClassEvolutionChart({ months, selectedMonth, onSelectMonth }: Props) {
  if (months.length === 0) return null;

  const ordered = [...months].sort((a, b) => a.month.localeCompare(b.month));
  const labels = ordered.map((m) => formatMonth(m.month));
  const values = ordered.map((m) => Math.round(m.geral));
  const selectedIndex = ordered.findIndex((m) => m.month === selectedMonth);

  return (
    <div
      className="w-full"
      aria-label="Evolução do desempenho geral da turma por mês"
    >
      <h3 className="text-base font-semibold mb-2">Evolução por mês</h3>
      <LineChart
        height={220}
        xAxis={[{ data: labels, scaleType: "point" }]}
        yAxis={[{ min: 0, max: 100 }]}
        series={[{ data: values, label: "Geral (%)", showMark: true }]}
        margin={{ left: 40, right: 16, top: 16, bottom: 32 }}
        slotProps={{ legend: { hidden: true } }}
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
          Mês selecionado: {labels[selectedIndex]} ({values[selectedIndex]}%)
        </p>
      )}
    </div>
  );
}
