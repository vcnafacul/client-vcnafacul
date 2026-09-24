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

// ── Gestão dos convites pelo admin do cursinho (card 06) ─────────────────

/** Um convite como o modal de convites mostra. */
export interface ConviteDoCursinho {
  id: string;
  email: string;
  funcao: { id: string; nome: string };
  convidadoPor: string;
  situacao: SituacaoDoConvite;
  expiraEm: string;
  createdAt: string;
}

const autenticado = (tokenDeLogin: string, corpo?: unknown): RequestInit => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${tokenDeLogin}`,
  },
  ...(corpo === undefined ? {} : { body: JSON.stringify(corpo) }),
});

const ok = async <T>(response: Response, padrao: string): Promise<T> => {
  if (response.status >= 200 && response.status < 300) {
    return (await response.json().catch(() => undefined)) as T;
  }
  throw new Error(await mensagemDe(response, padrao));
};

export async function listarConvites(
  tokenDeLogin: string,
): Promise<ConviteDoCursinho[]> {
  const response = await fetchWrapper(convitesColaborador, {
    method: "GET",
    ...autenticado(tokenDeLogin),
  });
  return ok(response, "Erro ao buscar os convites.");
}

/** ⚠️ A recusa (já há convite, já é colaborador, outro cursinho) traz o motivo. */
export async function criarConvite(
  tokenDeLogin: string,
  email: string,
  roleId: string,
): Promise<ConviteDoCursinho> {
  const response = await fetchWrapper(convitesColaborador, {
    method: "POST",
    ...autenticado(tokenDeLogin, { email, roleId }),
  });
  return ok(response, "Não foi possível enviar o convite.");
}

/** ⚠️ Gera link novo — o anterior deixa de valer. */
export async function reenviarConvite(
  tokenDeLogin: string,
  id: string,
): Promise<ConviteDoCursinho> {
  const response = await fetchWrapper(`${convitesColaborador}/${id}/reenviar`, {
    method: "POST",
    ...autenticado(tokenDeLogin),
  });
  return ok(response, "Não foi possível reenviar o convite.");
}

export async function trocarFuncaoDoConvite(
  tokenDeLogin: string,
  id: string,
  roleId: string,
): Promise<ConviteDoCursinho> {
  const response = await fetchWrapper(`${convitesColaborador}/${id}`, {
    method: "PATCH",
    ...autenticado(tokenDeLogin, { roleId }),
  });
  return ok(response, "Não foi possível trocar a função do convite.");
}

export async function cancelarConvite(
  tokenDeLogin: string,
  id: string,
): Promise<void> {
  const response = await fetchWrapper(`${convitesColaborador}/${id}`, {
    method: "DELETE",
    ...autenticado(tokenDeLogin),
  });
  await ok(response, "Não foi possível cancelar o convite.");
}
