import { convitesColaborador, googleAuth, googleCadastro } from "../urls";

/**
 * Login e cadastro com Google (série `login-com-google`, cards 01–03).
 *
 * ⚠️ **`fetch` direto, sem o `fetchWrapper`**: num 401 o wrapper tenta o
 * refresh e, se falha, manda para `/logoff`. Aqui o 401 é esperado — o cadastro
 * pendente venceu (30 min) — e a tela tem de mostrar isso, não sair.
 * O cookie `google_cadastro` vai com `credentials: "include"`.
 */

/**
 * Para onde o botão leva: a api, que leva ao Google.
 * @param convite token do link do convite de colaborador (card 05) — a api o
 *   carrega até o 2º passo.
 */
export function urlEntrarComGoogle(voltar?: string, convite?: string): string {
  const query = new URLSearchParams();
  if (voltar) query.set("voltar", voltar);
  if (convite) query.set("convite", convite);
  const texto = query.toString();
  return texto ? `${googleAuth}?${texto}` : googleAuth;
}

export interface CadastroGooglePendente {
  email: string;
  firstName: string;
  lastName: string;
  /** Token do convite, se o cadastro começou na página dele (card 05). */
  convite?: string;
}

export interface DadosDoCadastroGoogle {
  firstName: string;
  lastName: string;
  socialName?: string;
  phone: string;
  gender: number;
  birthday: string;
  state: string;
  city: string;
  lgpd: boolean;
}

/** Erro com o status, para a tela distinguir "venceu" (401) do resto. */
export class ErroDoCadastroGoogle extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

const erroDe = async (response: Response, padrao: string) => {
  const corpo = await response.json().catch(() => ({}));
  return new ErroDoCadastroGoogle(
    (corpo as { message?: string }).message ?? padrao,
    response.status,
  );
};

export async function buscarCadastroGoogle(): Promise<CadastroGooglePendente> {
  const response = await fetch(googleCadastro, { credentials: "include" });
  if (response.ok) return response.json();
  throw await erroDe(response, "Não foi possível carregar o cadastro.");
}

export async function concluirCadastroGoogle(
  dados: DadosDoCadastroGoogle,
): Promise<{ access_token: string; voltar: string }> {
  const response = await fetch(googleCadastro, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (response.ok) return response.json();
  throw await erroDe(response, "Não foi possível concluir o cadastro.");
}

/**
 * O 2º passo quando o cadastro veio de um convite (card 05): a conta nasce
 * colaboradora, com a função. Convite que não vale mais → 400, sem conta.
 */
export async function concluirCadastroGooglePeloConvite(
  dados: DadosDoCadastroGoogle,
): Promise<{ access_token: string }> {
  const response = await fetch(`${convitesColaborador}/cadastrar-pelo-google`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (response.ok) return response.json();
  throw await erroDe(response, "Não foi possível concluir o cadastro.");
}
