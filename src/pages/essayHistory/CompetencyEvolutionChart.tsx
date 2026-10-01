import { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import LineChartMui from "@/components/atoms/lineChartMui";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { EssayStatsTimelineEntry } from "@/dtos/essay";

const COMPETENCY_LABELS = [
  "Domínio da norma culta",
  "Compreensão do tema",
  "Argumentação",
  "Coesão textual",
  "Proposta de intervenção",
];

const COMP_FIELDS = [
  "comp1Score", "comp2Score", "comp3Score", "comp4Score", "comp5Score",
] as const;

const COLORS = ["#02B2AF", "#2E96FF", "#B800D8", "#FF7600", "#F43535"];

interface Props {
  timeline: EssayStatsTimelineEntry[];
}

export default function CompetencyEvolutionChart({ timeline }: Props) {
  const acimaDeSm = useAcimaDeSm();
  const hasAi = timeline.some((e) => e.aiReview !== null);
  const hasHuman = timeline.some((e) => e.humanReview !== null);
  // Abria sempre em IA: com a IA desligada o gráfico sumia inteiro, junto com
  // o botão de trocar para Humana.
  const [reviewType, setReviewType] = useState<"ai" | "human">(
    hasAi ? "ai" : "human",
  );

  const entries = timeline.filter((e) =>
    reviewType === "ai" ? e.aiReview : e.humanReview,
  );

  if (entries.length < 2) return null;

  const xAxis = entries.map((e) => e.themeTitle);

  const series = COMPETENCY_LABELS.map((label, i) => ({
    label,
    data: entries.map((e) => {
      const review = reviewType === "ai" ? e.aiReview : e.humanReview;
      return review ? review[COMP_FIELDS[i]] : null;
    }),
    color: COLORS[i],
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold">Evolução por Competência</p>
        {hasAi && hasHuman && (
          <ToggleButtonGroup
            size="small"
            value={reviewType}
            exclusive
            onChange={(_, val) => val && setReviewType(val)}
          >
            <ToggleButton value="ai">IA</ToggleButton>
            <ToggleButton value="human">Humana</ToggleButton>
          </ToggleButtonGroup>
        )}
      </div>
      <LineChartMui
        xAxis={xAxis}
        series={series}
        yAxisLabel="Nota"
        yAxisMax={200}
        height={acimaDeSm ? 300 : 240}
        compacto={!acimaDeSm}
      />
    </div>
  );
}
