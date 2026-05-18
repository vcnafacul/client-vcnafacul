import { RadarChart } from "@/components/atoms/radarChart";

interface Props {
  competencias: { c1: number; c2: number; c3: number; c4: number; c5: number };
}

const LABELS = {
  c1: "C1 — Norma culta",
  c2: "C2 — Tema",
  c3: "C3 — Argumentação",
  c4: "C4 — Coesão",
  c5: "C5 — Proposta",
};

export function CompetenciaRadar({ competencias }: Props) {
  const data = [
    { competencia: LABELS.c1, valor: percent(competencias.c1) },
    { competencia: LABELS.c2, valor: percent(competencias.c2) },
    { competencia: LABELS.c3, valor: percent(competencias.c3) },
    { competencia: LABELS.c4, valor: percent(competencias.c4) },
    { competencia: LABELS.c5, valor: percent(competencias.c5) },
  ];
  return (
    <RadarChart
      data={data}
      keys={["valor"]}
      indexBy="competencia"
      maxValue={100}
    />
  );
}

function percent(score0to200: number) {
  return Math.round((score0to200 / 200) * 100 * 10) / 10;
}
