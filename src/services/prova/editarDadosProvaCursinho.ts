import fetchWrapper from "../../utils/fetchWrapper";
import { cursinhoProva } from "../urls";

export type DadosDaProva = {
  nome?: string;
  ano?: number;
  edicao?: string;
  aplicacao?: number;
  categoria?: string;
};

/**
 * Card 41 — corrige os dados da prova do cursinho. Manda só o que mudou; as
 * recusas (nome em uso, categoria com cartão) chegam com a mensagem da api.
 */
export async function editarDadosProvaCursinho(
  id: string,
  dados: DadosDaProva,
  token: string,
): Promise<{ nome: string }> {
  const response = await fetchWrapper(
    `${cursinhoProva}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    },
  );
  const res = await response.json().catch(() => null);
  if (!response.ok) {
    const msg = Array.isArray(res?.message) ? res.message[0] : res?.message;
    throw new Error(msg || "Erro ao salvar os dados da prova");
  }
  return res;
}
