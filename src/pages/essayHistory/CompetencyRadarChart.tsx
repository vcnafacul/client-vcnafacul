import { RadarChart } from "@/components/atoms/radarChart";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
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

const CORES: Record<string, string> = { IA: "#2E96FF", Humana: "#0F9B2C" };

export default function CompetencyRadarChart({ timeline }: Props) {
  // Abaixo de 768px os rótulos do radar saíam cortados: vira barras.
  const acimaDeSm = useAcimaDeSm();
  const aiReviews = timeline
    .map((e) => e.aiReview)
    .filter((r): r is EssayStatsReview => r !== null);
  const humanReviews = timeline
    .map((e) => e.humanReview)
    .filter((r): r is EssayStatsReview => r !== null);

  const reviewedCount = timeline.filter((e) => e.aiReview || e.humanReview).length;
  if (reviewedCount < 2) return null;

  const hasHuman = humanReviews.length > 0;
  // A correção por IA pode estar desligada: sem nota de IA, o radar desenhava
  // "IA" com média 0.
  const keys = [
    ...(aiReviews.length > 0 ? ["IA"] : []),
    ...(hasHuman ? ["Humana"] : []),
  ];

  const data = COMPETENCY_LABELS.map((label, i) => {
    const compKey = COMP_KEYS[i];
    const entry: Record<string, string | number> = { competencia: label };
    if (aiReviews.length > 0) {
      entry.IA = average(aiReviews.map((r) => r[compKey]));
    }
    if (hasHuman) {
      entry.Humana = average(humanReviews.map((r) => r[compKey]));
    }
    return entry;
  });

  return (
    <div>
      <p className="text-sm font-bold mb-2">Média por Competência</p>
      {acimaDeSm ? (
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
      ) : (
        <ul className="space-y-3">
          {data.map((d) => (
            <li key={d.competencia}>
              <p className="text-sm mb-1">{d.competencia}</p>
              {keys.map((k) => {
                const valor = Number(d[k]);
                return (
                  <div key={k} className="flex items-center gap-2">
                    <span className="w-14 text-xs text-grey">{k}</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(valor / 200) * 100}%`,
                          backgroundColor: CORES[k],
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-bold">
                      {valor}
                    </span>
                  </div>
                );
              })}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
