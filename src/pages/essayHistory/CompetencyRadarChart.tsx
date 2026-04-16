import { RadarChart } from "@/components/atoms/radarChart";
import { EssayStatsTimelineEntry, EssayStatsReview } from "@/dtos/essay";

const COMPETENCY_LABELS = [
  "Domínio da norma culta",
  "Compreensão do tema",
  "Argumentação",
  "Coesão textual",
  "Proposta de intervenção",
] as const;

const COMP_KEYS: (keyof EssayStatsReview)[] = [
  "comp1Score", "comp2Score", "comp3Score", "comp4Score", "comp5Score",
];

interface Props {
  timeline: EssayStatsTimelineEntry[];
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export default function CompetencyRadarChart({ timeline }: Props) {
  const aiReviews = timeline
    .map((e) => e.aiReview)
    .filter((r): r is EssayStatsReview => r !== null);
  const humanReviews = timeline
    .map((e) => e.humanReview)
    .filter((r): r is EssayStatsReview => r !== null);

  const reviewedCount = timeline.filter((e) => e.aiReview || e.humanReview).length;
  if (reviewedCount < 2) return null;

  const hasHuman = humanReviews.length > 0;

  const keys = hasHuman ? ["IA", "Humana"] : ["IA"];

  const data = COMPETENCY_LABELS.map((label, i) => {
    const compKey = COMP_KEYS[i];
    const entry: Record<string, string | number> = {
      competencia: label,
      IA: average(aiReviews.map((r) => r[compKey])),
    };
    if (hasHuman) {
      entry.Humana = average(humanReviews.map((r) => r[compKey]));
    }
    return entry;
  });

  return (
    <div>
      <p className="text-sm font-bold mb-2">Média por Competência</p>
      <div style={{ height: 300 }}>
        <RadarChart
          data={data}
          keys={keys}
          indexBy="competencia"
          maxValue={200}
          scheme="paired"
          fill="#333"
        />
      </div>
    </div>
  );
}
