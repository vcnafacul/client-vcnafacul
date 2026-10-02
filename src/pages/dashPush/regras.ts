import { caminhoInterno } from "@/services/push/caminho";
import type { Destinatario, Publico } from "@/services/push/admin";

export const LIMITE_TITULO = 100;
export const LIMITE_CORPO = 500;
/** Palavra que confirma o envio para TODOS. */
export const PALAVRA_DE_CONFIRMACAO = "ENVIAR";

export type TipoDePublico = Publico["type"];

export type Rascunho = {
  title: string;
  body: string;
  url: string;
  tipo: TipoDePublico;
  roleIds: string[];
  /** "Pessoas específicas": escolhidas pela busca, nunca digitadas. */
  pessoas: Destinatario[];
};

export const RASCUNHO_VAZIO: Rascunho = {
  title: "",
  body: "",
  url: "",
  tipo: "roles",
  roleIds: [],
  pessoas: [],
};

export function publicoDo(r: Rascunho): Publico {
  if (r.tipo === "all") return { type: "all" };
  if (r.tipo === "roles") return { type: "roles", roleIds: r.roleIds };
  // ⚠️ O e-mail vem da busca (a pessoa existe), nunca digitado à mão.
  return {
    type: "emails",
    emails: r.pessoas.map((p) => p.email.toLowerCase()),
  };
}

/** Erros por campo, antes de chamar a api. Vazio = pode seguir. */
export function errosDo(r: Rascunho): Partial<Record<keyof Rascunho, string>> {
  const erros: Partial<Record<keyof Rascunho, string>> = {};
  const titulo = r.title.trim();
  const corpo = r.body.trim();
  if (!titulo) erros.title = "Escreva um título";
  else if (titulo.length > LIMITE_TITULO)
    erros.title = `Até ${LIMITE_TITULO} caracteres`;
  if (!corpo) erros.body = "Escreva a mensagem";
  else if (corpo.length > LIMITE_CORPO)
    erros.body = `Até ${LIMITE_CORPO} caracteres`;
  // ⚠️ Só link do próprio site: a api recusa o resto (phishing).
  if (r.url.trim() && caminhoInterno(r.url.trim()) === null)
    erros.url = "Use um caminho do site, como /simulados";
  if (r.tipo === "roles" && r.roleIds.length === 0)
    erros.roleIds = "Escolha ao menos uma função";
  if (r.tipo === "emails" && r.pessoas.length === 0)
    erros.pessoas = "Escolha ao menos uma pessoa";
  return erros;
}

export function descricaoDoPublico(
  p: Publico,
  nomeDaFuncao: (id: string) => string = (id) => id,
): string {
  if (p.type === "all") return "Todos";
  if (p.type === "roles")
    return `Funções: ${p.roleIds.map(nomeDaFuncao).join(", ")}`;
  return p.emails.length === 1
    ? `1 e-mail: ${p.emails[0]}`
    : `${p.emails.length} e-mails`;
}

/**
 * O que cada código de erro do FCM quer dizer para quem envia. Os de token
 * morto já desativam o aparelho na api: ele some do próximo envio.
 */
export const MOTIVOS_DE_FALHA: Record<string, string> = {
  "messaging/registration-token-not-registered":
    "o aparelho cancelou a inscrição (desativou nas configurações, limpou os dados ou desinstalou). Ele já foi removido; volta a receber quando abrir o app de novo",
  "messaging/invalid-registration-token":
    "token inválido. O aparelho já foi removido",
  "messaging/invalid-argument": "o Google recusou a mensagem ou o token",
  "messaging/third-party-auth-error":
    "o serviço de push do navegador recusou a credencial (chave VAPID)",
  "messaging/mismatched-credential": "o token é de outro projeto do Firebase",
  "messaging/message-rate-exceeded":
    "envios demais para esse aparelho em pouco tempo",
  "messaging/internal-error": "erro temporário do Google. Tente de novo",
  "messaging/server-unavailable": "erro temporário do Google. Tente de novo",
};

export function motivoDaFalha(codigo: string): string {
  return MOTIVOS_DE_FALHA[codigo] ?? `erro ${codigo}`;
}
