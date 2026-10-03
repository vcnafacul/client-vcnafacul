import type { Indicadores, Metricas } from "@/services/indicadores";

export interface PontoDaSerie {
  /** `YYYY-MM-DD` do ponto. */
  dia: string;
  /** "10/05" */
  rotulo: string;
  /** `null` = sem dado naquele dia (a métrica ainda não existia). */
  valor: number | null;
}

/** Segunda-feira da semana do dia (`YYYY-MM-DD`), para agrupar. */
function semana(dia: string) {
  const d = new Date(`${dia}T12:00:00Z`);
  const desdeSegunda = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - desdeSegunda);
  return d.toISOString().slice(0, 10);
}

const rotulo = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

/**
 * Um ponto por semana: o último dia com foto de cada semana. Um ponto por dia
 * vira ruído num período de meses, e o cursinho pensa em semanas de aula.
 */
export function pontosSemanais(
  serie: Indicadores["serie"],
  valor: (m: Metricas) => number | null,
): PontoDaSerie[] {
  const ultimoDaSemana = new Map<string, Indicadores["serie"][number]>();
  for (const ponto of serie) {
    const s = semana(ponto.dia);
    const atual = ultimoDaSemana.get(s);
    if (!atual || ponto.dia > atual.dia) ultimoDaSemana.set(s, ponto);
  }
  return [...ultimoDaSemana.values()]
    .sort((a, b) => a.dia.localeCompare(b.dia))
    .map((p) => ({ dia: p.dia, rotulo: rotulo(p.dia), valor: valor(p.metricas) }));
}
