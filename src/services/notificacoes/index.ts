import fetchWrapper from "@/utils/fetchWrapper";
import { meNotificacoes } from "../urls";

/** Uma notificação na central do app (série `central-notificacoes`). */
export type NotificacaoDaCentral = {
  id: string;
  titulo: string;
  corpo: string;
  url: string | null;
  lidaEm: string | null;
  createdAt: string;
};

export type PaginaDaCentral = {
  data: NotificacaoDaCentral[];
  page: number;
  limit: number;
  totalItems: number;
  naoLidas: number;
};

export const POR_PAGINA = 20;

const cabecalhos = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export async function listarNotificacoes(
  token: string,
  page = 1,
): Promise<PaginaDaCentral> {
  const res = await fetchWrapper(
    `${meNotificacoes}?page=${page}&limit=${POR_PAGINA}`,
    { headers: cabecalhos(token) },
  );
  if (!res.ok) throw new Error("Não foi possível carregar as notificações");
  return res.json();
}

export async function marcarNotificacaoLida(
  id: string,
  token: string,
): Promise<void> {
  const res = await fetchWrapper(`${meNotificacoes}/${id}/lida`, {
    method: "PATCH",
    headers: cabecalhos(token),
  });
  if (res.status !== 204) throw new Error("Não foi possível marcar como lida");
}

export async function marcarTodasLidas(token: string): Promise<void> {
  const res = await fetchWrapper(`${meNotificacoes}/lidas`, {
    method: "PATCH",
    headers: cabecalhos(token),
  });
  if (!res.ok) throw new Error("Não foi possível marcar como lidas");
}
