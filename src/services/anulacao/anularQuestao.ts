import { AnulacaoInput } from "@/dtos/question/anulacao";
import fetchWrapper from "@/utils/fetchWrapper";
import { prova } from "../urls";

/** Erro do servidor com o corpo inteiro — os 409 da anulação levam `code`. */
export class ErroDaAnulacao extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly corpo: Record<string, unknown>,
  ) {
    super(message);
  }
  get code(): string | undefined {
    return typeof this.corpo.code === "string" ? this.corpo.code : undefined;
  }
}

export async function lerErro(
  response: Response,
  padrao: string,
): Promise<ErroDaAnulacao> {
  const corpo = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const msg = Array.isArray(corpo.message)
    ? corpo.message.join(" ")
    : typeof corpo.message === "string"
      ? corpo.message
      : padrao;
  return new ErroDaAnulacao(msg, response.status, corpo);
}

const rota = (provaId: string, questaoId: string) =>
  `${prova}/${provaId}/questoes/${questaoId}/anulacao`;

/** tickets/042: anula a questão nesta prova (ou edita a anulação existente). */
export async function anularQuestao(
  provaId: string,
  questaoId: string,
  dto: AnulacaoInput,
  token: string,
): Promise<void> {
  const response = await fetchWrapper(rota(provaId, questaoId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      motivo: dto.motivo,
      justificativa: dto.justificativa.trim(),
    }),
  });
  if (!response.ok) throw await lerErro(response, "Erro ao anular a questão");
}

export async function desanularQuestao(
  provaId: string,
  questaoId: string,
  token: string,
): Promise<void> {
  const response = await fetchWrapper(rota(provaId, questaoId), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw await lerErro(response, "Erro ao desanular a questão");
}
