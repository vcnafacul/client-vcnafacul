import {
  AtualizacoesDaProva,
} from "../../dtos/prova/atualizacao";
import fetchWrapper from "../../utils/fetchWrapper";
import { provaById } from "../urls";

/** As atualizações disponíveis das questões da prova (tickets/023, card 13). */
export async function listarAtualizacoes(
  provaId: string,
  token: string,
): Promise<AtualizacoesDaProva> {
  const response = await fetchWrapper(`${provaById(provaId)}/atualizacoes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const corpo = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(corpo?.message ?? "Erro ao buscar as atualizações");
  }
  return corpo;
}

/**
 * Aplica as versões escolhidas na prova e nos simulados dela (card 14). Só o
 * dono — 403/400 viram a mensagem do erro.
 */
export async function aplicarAtualizacoes(
  provaId: string,
  trocas: { de: string; para: string }[],
  token: string,
): Promise<{ trocadas: number; simulados: number }> {
  const response = await fetchWrapper(`${provaById(provaId)}/atualizacoes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ trocas }),
  });
  const corpo = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(corpo?.message ?? "Erro ao aplicar as atualizações");
  }
  return corpo;
}
