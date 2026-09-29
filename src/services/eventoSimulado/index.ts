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
  provas: { provaId: string; nome: string; inscritos: number }[];
  totalInscritos: number;
};

export type SalvarEvento = {
  nome: string;
  descricao: string | null;
  inscricoesDe: string;
  inscricoesAte: string;
  provaIds: string[];
};

export type EngajamentoDoEvento = {
  porProva: {
    provaId: string;
    nome: string;
    inscritos: number;
    fizeram: number;
    naoVieram: number;
  }[];
  totalInscritos: number;
  inscritosQueFizeram: number;
  engajamento: number | null;
  inscritos: { nome: string; provaId: string; fez: boolean }[];
  fizeramSemInscricao: { nome: string; provaId: string }[];
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

export type EventoParaOAluno = {
  id: string;
  nome: string;
  descricao: string | null;
  cursinho: string;
  inscricoesAte: string;
  provas: { provaId: string; nome: string }[];
  /** `null` = ainda não se inscreveu. */
  minhaProvaId: string | null;
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
): Promise<{ evento: EventoParaOAluno; resultado: "nova" | "troca" | "igual" }> {
  const r = await fetchWrapper(`${eventosSimulado}/${eventoId}/inscricao`, {
    method: "PUT",
    headers: json(token),
    body: JSON.stringify(provaId ? { provaId } : {}),
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
