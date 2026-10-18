import { Period } from "@/enums/analytics/period";
import { AggregateStudentCoursePeriod } from "@/services/analytics/prepCourse/dtos/aggregate-student-course-period";
import { AggregateHistoricoByPeriod } from "@/services/analytics/simulado/aggregateByPeriod";
import { AggregatePeriodByType } from "@/services/analytics/simulado/aggregateByPeriodAndType";
import { HistoricoSummaryResponse } from "@/services/analytics/simulado/historicoSummary";
import { AggregateUsersByRole } from "@/services/analytics/user/dtos/aggregate-users-role";
import { monitoramento } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

/**
 * O Monitoramento recortado por cursinho (tickets/044): as rotas `/monitoramento/*`
 * da api, uma por número da tela.
 */

/** 502 da api: o ms não respondeu. A seção mostra "Indisponível agora". */
export class MonitoramentoIndisponivel extends Error {
  constructor() {
    super("Indisponível agora");
    this.name = "MonitoramentoIndisponivel";
  }
}

/** 403: falta a permissão daquele número (ex.: estudantes). A seção esconde o card. */
export class MonitoramentoSemPermissao extends Error {
  constructor() {
    super("Sem permissão");
    this.name = "MonitoramentoSemPermissao";
  }
}

async function buscar<T>(
  rota: string,
  params: Record<string, string | number | boolean | undefined>,
  token: string,
): Promise<T> {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") query.set(k, String(v));
  }
  const response = await fetchWrapper(`${monitoramento}/${rota}?${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 502) throw new MonitoramentoIndisponivel();
  if (response.status === 403) throw new MonitoramentoSemPermissao();
  if (response.status !== 200) {
    throw new Error("Erro ao buscar o monitoramento do cursinho");
  }
  return response.json();
}

export type ResumoDoCursinho = {
  processosNaoTeste: number;
  processosTotal: number;
  inscricoesNaoTeste: number;
  matriculasNaoTeste: number;
};

export type EstudantesDoCursinho = {
  estudantesAtendidos: number;
  estudantesAtivos: number;
};

export type UltimoAcessoDoCursinho = {
  period: string;
  colaboradores: number;
  estudantes: number;
};

export type SituacaoDoProcesso = "aberto" | "encerrado" | "futuro";

export type UltimoProcesso = {
  id: string;
  nome: string;
  cursinho: { id: string; nome: string };
  inicio: string;
  fim: string;
  situacao: SituacaoDoProcesso;
  inscricoes: number;
  matriculas: number;
};

export const resumoDoCursinho = (cursinhoId: string, token: string) =>
  buscar<ResumoDoCursinho>("resumo", { cursinhoId }, token);

export const estudantesDoCursinho = (cursinhoId: string, token: string) =>
  buscar<EstudantesDoCursinho>("estudantes", { cursinhoId }, token);

export const usuariosPorPerfilDoCursinho = (
  cursinhoId: string,
  baseOnly: boolean,
  token: string,
) =>
  buscar<AggregateUsersByRole[]>(
    "usuarios-por-perfil",
    { cursinhoId, baseOnly: baseOnly || undefined },
    token,
  );

export const ultimoAcessoDoCursinho = (
  cursinhoId: string,
  groupBy: Period,
  token: string,
) =>
  buscar<UltimoAcessoDoCursinho[]>("ultimo-acesso", { cursinhoId, groupBy }, token);

export const inscricoesPorPeriodoDoCursinho = (
  cursinhoId: string,
  groupBy: Period,
  token: string,
) =>
  buscar<AggregateStudentCoursePeriod[]>(
    "inscricoes-por-periodo",
    { cursinhoId, groupBy },
    token,
  );

export const simuladosResumoDoCursinho = (cursinhoId: string, token: string) =>
  buscar<HistoricoSummaryResponse>("simulados/resumo", { cursinhoId }, token);

export const simuladosPorPeriodoDoCursinho = (
  cursinhoId: string,
  groupBy: Period,
  token: string,
) =>
  buscar<AggregateHistoricoByPeriod[]>(
    "simulados/por-periodo",
    { cursinhoId, groupBy },
    token,
  );

export const simuladosPorTipoDoCursinho = (
  cursinhoId: string,
  groupBy: Period,
  token: string,
) =>
  buscar<AggregatePeriodByType[]>("simulados/por-tipo", { cursinhoId, groupBy }, token);

/** Sem `cursinhoId`: a plataforma inteira (D7). */
export const ultimosProcessos = (
  token: string,
  cursinhoId?: string,
  limite = 10,
) => buscar<UltimoProcesso[]>("ultimos-processos", { cursinhoId, limite }, token);
