import fetchWrapper from "@/utils/fetchWrapper";
import { indicadores, indicadoresPeriodos } from "../urls";

/**
 * Contagens de uma turma (ou da soma das turmas) — nunca percentuais: a taxa
 * é calculada na tela a partir delas (tickets/033, README "snapshot").
 * Cada card da série acrescenta suas chaves.
 */
export type Metricas = Record<
  string,
  number | Record<string, number> | null | undefined
>;

export interface PeriodoDoIndicador {
  id: string;
  nome: string;
  ano: number;
  inicio: string;
  fim: string;
  emAndamento: boolean;
}

export interface PeriodosDoCursinho {
  periodos: PeriodoDoIndicador[];
  /** Turmas sem período letivo: não entram nos números (R1). */
  turmasSemPeriodo: number;
}

export interface TurmaDoIndicador {
  id: string;
  nome: string;
  metricas: Metricas;
}

export interface Indicadores {
  periodo: PeriodoDoIndicador;
  /** Quando os números foram calculados (ISO). */
  atualizadoEm: string;
  cursinho: Metricas;
  turmas: TurmaDoIndicador[];
  /** Um ponto por dia, do snapshot diário. */
  serie: { dia: string; metricas: Metricas }[];
}

const headers = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export async function getPeriodosDosIndicadores(
  token: string,
): Promise<PeriodosDoCursinho> {
  const response = await fetchWrapper(indicadoresPeriodos, {
    method: "GET",
    headers: headers(token),
  });
  if (response.status !== 200)
    throw new Error("Erro ao buscar os períodos letivos");
  return response.json();
}

export async function getIndicadores(
  token: string,
  periodoId: string,
): Promise<Indicadores> {
  const response = await fetchWrapper(
    `${indicadores}?periodoId=${encodeURIComponent(periodoId)}`,
    { method: "GET", headers: headers(token) },
  );
  if (response.status !== 200)
    throw new Error("Erro ao buscar os indicadores");
  return response.json();
}

/** Lê uma contagem; ausente (card ainda não existia naquele dia) → `null`. */
export function contagem(metricas: Metricas | undefined, chave: string) {
  const v = metricas?.[chave];
  return typeof v === "number" ? v : null;
}
