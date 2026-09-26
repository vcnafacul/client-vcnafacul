import { AproveitamentoHitoriesDTO } from '@/dtos/historico/getPerformanceDTO';
import { EssayStatsTimelineEntry } from '@/dtos/essay';

/** O ms-simulado devolve aproveitamento em 0..1. */
export function toPercent(ratio: number) {
  return Number.isFinite(ratio) ? Math.round(ratio * 100) : 0;
}

export function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export type PerformancePoint = {
  id: string;
  label: string;
  name: string;
  value: number;
};

export function performancePoints(
  historicos: AproveitamentoHitoriesDTO['historicos'],
): PerformancePoint[] {
  // O ms-simulado devolve do mais recente para o mais antigo; o gráfico lê
  // da esquerda (antigo) para a direita (recente).
  return [...historicos]
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .filter((h) => Number.isFinite(h.performance?.geral))
    .map((h) => ({
      id: h.historyId,
      label: formatDate(h.createdAt),
      name: h.testName,
      value: toPercent(h.performance.geral),
    }));
}

/** Revisão humana tem precedência sobre a da IA. */
export function essayScore(entry: EssayStatsTimelineEntry) {
  return entry.humanReview?.totalScore ?? entry.aiReview?.totalScore ?? null;
}
