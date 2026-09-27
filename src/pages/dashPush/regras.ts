import { caminhoInterno } from "@/services/push/caminho";
import type { Publico } from "@/services/push/admin";

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
  emailsTexto: string;
};

export const RASCUNHO_VAZIO: Rascunho = {
  title: "",
  body: "",
  url: "",
  tipo: "roles",
  roleIds: [],
  emailsTexto: "",
};

/** Um por linha, vírgula ou ponto e vírgula; sem repetidos, em minúsculas. */
export function emailsDoTexto(texto: string): string[] {
  return [
    ...new Set(
      texto
        .split(/[\n,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

export function publicoDo(r: Rascunho): Publico {
  if (r.tipo === "all") return { type: "all" };
  if (r.tipo === "roles") return { type: "roles", roleIds: r.roleIds };
  return { type: "emails", emails: emailsDoTexto(r.emailsTexto) };
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
  if (r.tipo === "emails" && emailsDoTexto(r.emailsTexto).length === 0)
    erros.emailsTexto = "Cole ao menos um e-mail";
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
