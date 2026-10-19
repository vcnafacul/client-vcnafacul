import fetchWrapper from "@/utils/fetchWrapper";
import {
  indicadores,
  indicadoresPeriodos,
  indicadoresDesempenho,
  indicadoresResumo,
  indicadoresSumindo,
} from "../urls";

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

/**
 * tickets/045 — com `cursinhoId`, as rotas do admin
 * (`/indicadores/cursinho/:id/...`); sem, as do próprio cursinho (como sempre).
 */
const rota = (
  propria: string,
  sufixo: string,
  cursinhoId?: string,
  query = "",
) =>
  cursinhoId
    ? `${indicadores}/cursinho/${encodeURIComponent(cursinhoId)}${sufixo}${query}`
    : `${propria}${query}`;

/** 404 nas rotas do próprio cursinho: quem pede não é de cursinho nenhum. */
export class SemCursinho extends Error {
  constructor() {
    super("Você não é de um cursinho");
    this.name = "SemCursinho";
  }
}

const headers = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export async function getPeriodosDosIndicadores(
  token: string,
  cursinhoId?: string,
): Promise<PeriodosDoCursinho> {
  const response = await fetchWrapper(
    rota(indicadoresPeriodos, "/periodos", cursinhoId),
    { method: "GET", headers: headers(token) },
  );
  if (response.status === 404 && !cursinhoId) throw new SemCursinho();
  if (response.status !== 200)
    throw new Error("Erro ao buscar os períodos letivos");
  return response.json();
}

export async function getIndicadores(
  token: string,
  periodoId: string,
  cursinhoId?: string,
): Promise<Indicadores> {
  const response = await fetchWrapper(
    rota(indicadores, "", cursinhoId, `?periodoId=${encodeURIComponent(periodoId)}`),
    { method: "GET", headers: headers(token) },
  );
  if (response.status !== 200)
    throw new Error("Erro ao buscar os indicadores");
  return response.json();
}

export interface AlunoSumindo {
  alunoId: string;
  nome: string;
  turma: string;
  /** `YYYY-MM-DD`; `null` se nunca veio. */
  ultimaPresenca: string | null;
  faltasSeguidas: number;
  /** Só vem para quem pode gerenciar estudantes (nunca na visão do admin, 045). */
  telefone?: string | null;
}

export async function getSumindo(
  token: string,
  periodoId: string,
  cursinhoId?: string,
): Promise<AlunoSumindo[]> {
  const response = await fetchWrapper(
    rota(
      indicadoresSumindo,
      "/sumindo",
      cursinhoId,
      `?periodoId=${encodeURIComponent(periodoId)}`,
    ),
    { method: "GET", headers: headers(token) },
  );
  if (response.status !== 200)
    throw new Error("Erro ao buscar quem está sumindo");
  return response.json();
}

export interface Aplicacao {
  simuladoId: string;
  nome: string;
  /** Data da aplicação (ISO): o primeiro cartão enviado. */
  em: string | null;
  /** Aproveitamento médio, 0..100. */
  media: number | null;
  participantes: number;
}

export interface Desempenho {
  aplicacoes: Aplicacao[];
  porTurma: {
    turmaId: string;
    ultimaAplicacao: { nome: string; media: number | null } | null;
  }[];
  porMes: {
    /** `YYYY-MM` */
    mes: string;
    simulados: { participantes: number; media: number | null };
    /** Nota 0..1000. */
    redacao: { corrigidas: number; media: number | null };
  }[];
}

export async function getDesempenho(
  token: string,
  periodoId: string,
  cursinhoId?: string,
): Promise<Desempenho> {
  const response = await fetchWrapper(
    rota(
      indicadoresDesempenho,
      "/desempenho",
      cursinhoId,
      `?periodoId=${encodeURIComponent(periodoId)}`,
    ),
    { method: "GET", headers: headers(token) },
  );
  if (response.status !== 200)
    throw new Error("Erro ao buscar o desempenho");
  return response.json();
}

export interface ResumoDosIndicadores {
  /** A pessoa é de um cursinho? (equipe do projeto: não) */
  cursinho: boolean;
  /** Os períodos em andamento somados (normalmente um). */
  periodos: { id: string; nome: string }[];
  /** `null` sem período em andamento. */
  metricas: Metricas | null;
}

export async function getResumoDosIndicadores(
  token: string,
): Promise<ResumoDosIndicadores> {
  const response = await fetchWrapper(indicadoresResumo, {
    method: "GET",
    headers: headers(token),
  });
  if (response.status !== 200)
    throw new Error("Erro ao buscar os indicadores do cursinho");
  return response.json();
}

/** Lê uma contagem; ausente (card ainda não existia naquele dia) → `null`. */
export function contagem(metricas: Metricas | undefined, chave: string) {
  const v = metricas?.[chave];
  return typeof v === "number" ? v : null;
}
