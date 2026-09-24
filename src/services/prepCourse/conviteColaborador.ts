import type { UserRegister } from "@/types/user/userRegister";
import fetchWrapper from "@/utils/fetchWrapper";
import { convitesColaborador } from "../urls";

export type SituacaoDoConvite = "pendente" | "expirado" | "aceito" | "cancelado";

/** O que a página do link mostra antes do login (cards 04 e 05). */
export interface ConvitePorToken {
  nomeCursinho: string;
  funcao: string;
  email: string;
  situacao: SituacaoDoConvite;
  expiraEm: string;
  temConta: boolean;
}

const mensagemDe = async (response: Response, padrao: string) => {
  const corpo = await response.json().catch(() => ({}));
  return (corpo as { message?: string }).message ?? padrao;
};

/**
 * ⚠️ **Sem Authorization** — é público, e só responde a quem tem o token.
 */
export async function buscarConvitePorToken(
  token: string,
): Promise<ConvitePorToken> {
  const response = await fetchWrapper(
    `${convitesColaborador}/por-token/${encodeURIComponent(token)}`,
    { method: "GET" },
  );
  if (response.status === 200) return await response.json();
  throw new Error(await mensagemDe(response, "Convite não encontrado."));
}

/**
 * Aceita o convite com a conta LOGADA (card 04).
 *
 * ⚠️ O token do convite vai no CORPO, e não como Bearer: ele não autentica
 * nada — quem autentica é o login.
 */
export async function aceitarConvite(
  token: string,
  tokenDeLogin: string,
): Promise<void> {
  const response = await fetchWrapper(`${convitesColaborador}/aceitar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenDeLogin}`,
    },
    body: JSON.stringify({ token }),
  });
  if (response.status === 201 || response.status === 200) return;
  throw new Error(await mensagemDe(response, "Não foi possível aceitar o convite."));
}

/**
 * Cadastro pelo convite (card 05): cria a conta E aceita o convite — e já
 * devolve a sessão de login.
 *
 * ⚠️ Sem Authorization (ainda não há conta). O refresh volta em cookie
 * httpOnly — o `fetchWrapper` sempre manda `credentials: "include"`.
 */
export async function cadastrarPeloConvite(
  token: string,
  dados: UserRegister,
): Promise<{ access_token: string }> {
  const response = await fetchWrapper(`${convitesColaborador}/cadastrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...dados,
      gender: parseInt(dados.gender as unknown as string),
      token,
    }),
  });
  if (response.status === 201) return await response.json();
  throw new Error(
    await mensagemDe(response, "Não foi possível concluir o cadastro."),
  );
}
