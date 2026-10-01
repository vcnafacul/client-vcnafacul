import LineChartMui from "@/components/atoms/lineChartMui";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { EssayStatsTimelineEntry } from "@/dtos/essay";

interface Props {
  timeline: EssayStatsTimelineEntry[];
}

export default function ScoreEvolutionChart({ timeline }: Props) {
  const acimaDeSm = useAcimaDeSm();
  const reviewed = timeline.filter((e) => e.aiReview || e.humanReview);
  if (reviewed.length < 2) return null;

  const xAxis = reviewed.map((e) => e.themeTitle);

  const aiData = reviewed.map((e) => e.aiReview?.totalScore ?? null);
  const humanData = reviewed.map((e) => e.humanReview?.totalScore ?? null);

  // A correção por IA pode estar desligada: sem nota de IA, sem a série vazia.
  const series: { label: string; data: (number | null)[]; color: string }[] =
    [];
  if (aiData.some((v) => v !== null)) {
    series.push({ label: "Correção IA", data: aiData, color: "#2E96FF" });
  }

  const hasHuman = humanData.some((v) => v !== null);
  if (hasHuman) {
    series.push({ label: "Correção Humana", data: humanData, color: "#0F9B2C" });
  }

  return (
    <LineChartMui
      title="Evolução da Nota Geral"
      xAxis={xAxis}
      series={series}
      yAxisLabel="Nota"
      yAxisMax={1000}
      height={acimaDeSm ? 300 : 240}
      compacto={!acimaDeSm}
    />
  );
}
