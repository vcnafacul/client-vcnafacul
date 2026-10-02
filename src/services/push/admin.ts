import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";
import {
  pushNotifications,
  pushPreview,
  pushRecipients,
  pushSend,
} from "../urls";

/** Públicos do MVP (decisão nº 1 da série): todos, por função, por e-mail. */
export type Publico =
  | { type: "all" }
  | { type: "roles"; roleIds: string[] }
  | { type: "emails"; emails: string[] };

export type NovaNotificacao = {
  title: string;
  body: string;
  url?: string;
  audience: Publico;
};

export type StatusDoEnvio = "sending" | "done" | "failed";

export type Envio = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  audience: Publico;
  status: StatusDoEnvio;
  targetUsers: number;
  targetDevices: number;
  successCount: number;
  failureCount: number;
  /** Código do FCM → quantos falharam com ele; `null` sem falhas. */
  failureReasons: Record<string, number> | null;
  /** Quem recebeu na central do app, e quantos leram lá (central, card 05). */
  pessoas?: number;
  leram?: number;
  createdAt: string;
  finishedAt: string | null;
  sentBy: { id: string; name: string } | null;
};

export type Alcance = {
  /** Com push ativo. */
  targetUsers: number;
  targetDevices: number;
  /** Todas as contas do público: quem vê na central do app. */
  pessoas?: number;
};

/** Pessoa achada pela busca, com quantos aparelhos ATIVOS tem. */
export type Destinatario = {
  id: string;
  name: string;
  email: string;
  devices: number;
};

/** Erro com a mensagem da api (ex.: o 422 de público sem aparelho). */
async function falha(res: Response, padrao: string): Promise<never> {
  let mensagem = padrao;
  try {
    const corpo = await res.json();
    const m = Array.isArray(corpo?.message) ? corpo.message[0] : corpo?.message;
    if (m) mensagem = m;
  } catch {
    /* corpo vazio */
  }
  throw new Error(mensagem);
}

const cabecalhos = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export async function conferirPublico(
  audience: Publico,
  token: string,
): Promise<Alcance> {
  const res = await fetchWrapper(pushPreview, {
    method: "POST",
    headers: cabecalhos(token),
    body: JSON.stringify({ audience }),
  });
  if (!res.ok) return falha(res, "Não foi possível conferir o público");
  return res.json();
}

export async function enviarNotificacao(
  nova: NovaNotificacao,
  token: string,
): Promise<Alcance & { id: string; status: StatusDoEnvio }> {
  const res = await fetchWrapper(pushSend, {
    method: "POST",
    headers: cabecalhos(token),
    body: JSON.stringify(nova),
  });
  if (res.status !== 202) return falha(res, "Não foi possível enviar");
  return res.json();
}

export async function listarEnvios(
  token: string,
  page: number,
  limit: number,
): Promise<Paginate<Envio>> {
  const res = await fetchWrapper(
    `${pushNotifications}?page=${page}&limit=${limit}`,
    { headers: cabecalhos(token) },
  );
  if (!res.ok) return falha(res, "Não foi possível carregar o histórico");
  return res.json();
}

export async function buscarEnvio(id: string, token: string): Promise<Envio> {
  const res = await fetchWrapper(`${pushNotifications}/${id}`, {
    headers: cabecalhos(token),
  });
  if (!res.ok) return falha(res, "Não foi possível acompanhar o envio");
  return res.json();
}

/** Busca por nome ou e-mail, como na tela de usuários. */
export async function buscarDestinatarios(
  texto: string,
  token: string,
): Promise<Destinatario[]> {
  const res = await fetchWrapper(
    `${pushRecipients}?q=${encodeURIComponent(texto)}`,
    { headers: cabecalhos(token) },
  );
  if (!res.ok) return falha(res, "Não foi possível buscar as pessoas");
  return res.json();
}
