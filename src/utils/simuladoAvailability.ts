import { SimuladoResumo } from "../dtos/prova/prova";

export type AvailabilityStatus =
  | "disponivel"
  | "bloqueado"
  | "antes_da_janela"
  | "depois_da_janela";

/**
 * Espelha getAvailabilityStatus do ms-simulado (availability.ts).
 * Duplicação intencional: o backend é a fonte de verdade nas decisões
 * críticas (gate 403 em getToAnswer); aqui é só para render.
 */
export function getStatus(
  simulado: Pick<
    SimuladoResumo,
    "bloqueado" | "disponivelDe" | "disponivelAte"
  >,
  now: Date = new Date(),
): AvailabilityStatus {
  if (simulado.bloqueado) return "bloqueado";
  const de = simulado.disponivelDe ? new Date(simulado.disponivelDe) : null;
  const ate = simulado.disponivelAte ? new Date(simulado.disponivelAte) : null;
  if (de && now < de) return "antes_da_janela";
  if (ate && now > ate) return "depois_da_janela";
  return "disponivel";
}

/** true quando disponível sem janela definida (null/null) → estado "⚪ Sem janela". */
export function isSemJanela(
  simulado: Pick<SimuladoResumo, "disponivelDe" | "disponivelAte">,
): boolean {
  return !simulado.disponivelDe && !simulado.disponivelAte;
}
