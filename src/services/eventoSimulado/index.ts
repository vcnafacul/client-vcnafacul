import fetchWrapper from "@/utils/fetchWrapper";
import { eventosSimulado } from "../urls";

/** Eventos de simulado presencial do cursinho (tickets/026). */

export type StatusDoEvento = "agendado" | "aberto" | "encerrado";

export type EventoDoCursinho = {
  id: string;
  nome: string;
  descricao: string | null;
  inscricoesDe: string;
  inscricoesAte: string;
  status: StatusDoEvento;
  provas: {
    provaId: string;
    nome: string;
    inscritos: number;
    /** tickets/039: só na prova de mais de um simulado (Enem Dia 1). */
    simulados?: { simuladoId: string; nome: string; inscritos: number }[];
  }[];
  totalInscritos: number;
};

export type SalvarEvento = {
  nome: string;
  descricao: string | null;
  inscricoesDe: string;
  inscricoesAte: string;
  provaIds: string[];
};

export type NumerosDoPainel = {
  inscritos: number;
  /** Quem fez ESTA prova (ou este simulado), inscrito nela ou noutra (card 38). */
  fizeram: number;
  /** Inscritos aqui que fizeram outra prova — ou, no Enem Dia 1, a outra língua. */
  trocaram: number;
  naoVieram: number;
};

export type EngajamentoDoEvento = {
  /**
   * Os números de cada prova são o TOTAL dela. tickets/039: `simulados` quebra a
   * prova por simulado (no Enem Dia 1, Inglês e Espanhol); ausente num api de
   * antes. `semSimulado`: inscrições de antes, sem a língua.
   */
  porProva: ({
    provaId: string;
    nome: string;
    simulados?: ({ simuladoId: string; nome: string } & NumerosDoPainel)[];
    semSimulado?: number;
  } & NumerosDoPainel)[];
  totalInscritos: number;
  inscritosQueFizeram: number;
  engajamento: number | null;
  inscritos: {
    nome: string;
    provaId: string;
    simuladoId?: string | null;
    fez: boolean;
    /** Diferente de `provaId` = trocou de prova (card 38). */
    provaQueFez: string | null;
    /** tickets/039: diferente de `simuladoId` = trocou (inclusive de língua). */
    simuladoQueFez?: string | null;
  }[];
  fizeramSemInscricao: { nome: string; provaId: string; simuladoId?: string }[];
};

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
const json = (token: string) => ({
  "Content-Type": "application/json",
  ...auth(token),
});

/** A mensagem da api (400/403/404/409/503) vira o texto do erro. */
async function falha(response: Response, padrao: string): Promise<never> {
  const corpo = await response.json().catch(() => null);
  const msg = Array.isArray(corpo?.message) ? corpo.message[0] : corpo?.message;
  throw new Error(msg || padrao);
}

// ---- cursinho ----

export async function listarEventos(token: string): Promise<EventoDoCursinho[]> {
  const r = await fetchWrapper(`${eventosSimulado}/cursinho`, {
    method: "GET",
    headers: auth(token),
  });
  if (!r.ok) return falha(r, "Erro ao carregar os eventos");
  return r.json();
}

export async function salvarEvento(
  token: string,
  evento: SalvarEvento,
  id?: string,
): Promise<EventoDoCursinho> {
  const r = await fetchWrapper(
    id ? `${eventosSimulado}/cursinho/${id}` : `${eventosSimulado}/cursinho`,
    { method: id ? "PUT" : "POST", headers: json(token), body: JSON.stringify(evento) },
  );
  if (!r.ok) return falha(r, "Erro ao salvar o evento");
  return r.json();
}

export async function excluirEvento(token: string, id: string): Promise<void> {
  const r = await fetchWrapper(`${eventosSimulado}/cursinho/${id}`, {
    method: "DELETE",
    headers: auth(token),
  });
  if (!r.ok) return falha(r, "Erro ao excluir o evento");
}

export async function engajamentoDoEvento(
  token: string,
  id: string,
): Promise<EngajamentoDoEvento> {
  const r = await fetchWrapper(`${eventosSimulado}/cursinho/${id}/engajamento`, {
    method: "GET",
    headers: auth(token),
  });
  if (!r.ok) return falha(r, "Erro ao carregar o engajamento");
  return r.json();
}

// ---- aluno (card 07) ----

/**
 * O que o aluno escolhe (tickets/039): um simulado de uma prova do evento.
 * Prova de um simulado = uma opção com o nome dela; Enem Dia 1 = "… Inglês" e
 * "… Espanhol".
 */
export type OpcaoDoEvento = {
  provaId: string;
  simuladoId: string | null;
  nome: string;
};

export type EventoParaOAluno = {
  id: string;
  nome: string;
  descricao: string | null;
  cursinho: string;
  inscricoesAte: string;
  provas: { provaId: string; nome: string }[];
  /** tickets/039. Ausente num api de antes — aí as opções são as provas. */
  opcoes?: OpcaoDoEvento[];
  /** `null` = ainda não se inscreveu. */
  minhaProvaId: string | null;
  meuSimuladoId?: string | null;
};

export async function meusEventos(token: string): Promise<EventoParaOAluno[]> {
  const r = await fetchWrapper(`${eventosSimulado}/meus`, {
    method: "GET",
    headers: auth(token),
  });
  if (!r.ok) return falha(r, "Erro ao carregar os simulados do cursinho");
  return r.json();
}

export async function inscreverNoEvento(
  token: string,
  eventoId: string,
  provaId?: string,
  simuladoId?: string,
): Promise<{ evento: EventoParaOAluno; resultado: "nova" | "troca" | "igual" }> {
  const r = await fetchWrapper(`${eventosSimulado}/${eventoId}/inscricao`, {
    method: "PUT",
    headers: json(token),
    body: JSON.stringify({
      ...(provaId && { provaId }),
      ...(simuladoId && { simuladoId }),
    }),
  });
  if (!r.ok) return falha(r, "Erro ao se inscrever");
  return r.json();
}

export async function desistirDoEvento(token: string, eventoId: string): Promise<void> {
  const r = await fetchWrapper(`${eventosSimulado}/${eventoId}/inscricao`, {
    method: "DELETE",
    headers: auth(token),
  });
  if (!r.ok) return falha(r, "Erro ao desistir");
}
