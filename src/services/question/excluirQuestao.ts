import fetchWrapper from "@/utils/fetchWrapper";
import { questoes } from "../urls";

/** Um motivo de recusa: código para decidir, texto para mostrar (card 33). */
export interface MotivoParaNaoExcluir {
  codigo:
    | "aprovada"
    | "respondida"
    | "em-prova"
    | "em-simulado"
    | "origem-de-outras"
    | "congelada";
  texto: string;
}

export interface CondicoesDeExclusao {
  podeExcluir: boolean;
  motivos: MotivoParaNaoExcluir[];
}

const headers = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

/**
 * Se a questão pode ser excluída — as MESMAS condições que o `DELETE` verifica.
 *
 * ⚠️ Serve para decidir se o botão aparece, não para garantir nada: entre esta
 * consulta e o clique, alguém pode pôr a questão numa prova.
 */
export async function podeExcluirQuestao(
  token: string,
  questaoId: string,
): Promise<CondicoesDeExclusao> {
  const response = await fetchWrapper(`${questoes}/${questaoId}/exclusao`, {
    method: "GET",
    headers: headers(token),
  });
  if (response.status !== 200) {
    throw new Error("Erro ao verificar se a questão pode ser excluída");
  }
  return await response.json();
}

/**
 * Exclui uma questão órfã (card 33).
 *
 * ⚠️ **A recusa NÃO é exceção** — é resposta esperada (`409`, com os motivos),
 * e quem chama precisa mostrá-los. Só falha de verdade (rede, 5xx) lança.
 */
export async function excluirQuestao(
  token: string,
  questaoId: string,
): Promise<
  | { excluida: true }
  | { excluida: false; motivos: MotivoParaNaoExcluir[]; mensagem: string }
> {
  const response = await fetchWrapper(`${questoes}/${questaoId}`, {
    method: "DELETE",
    headers: headers(token),
  });
  if (response.status === 200) return { excluida: true };
  if (response.status === 409) {
    const corpo = await response.json();
    return {
      excluida: false,
      motivos: corpo.motivos ?? [],
      mensagem: corpo.message ?? "Esta questão não pode ser excluída.",
    };
  }
  throw new Error("Erro ao excluir a questão");
}
