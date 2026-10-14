import { collaborator } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

/** Um ex-membro do cursinho (tickets/040, card 05) — sem email nem telefone. */
export interface ExMembro {
  id: string;
  nome: string;
  foto: string | null;
  entrada: string;
  saida: string;
  funcaoQueTinha: string | null;
  funcaoDada: string | null;
  excluidoPor: string | null;
}

export interface PaginaDeExMembros {
  data: ExMembro[];
  totalItems: number;
  page: number;
  limit: number;
}

export async function getExMembros(
  token: string,
  page: number,
  limit: number,
): Promise<PaginaDeExMembros> {
  const response = await fetchWrapper(
    `${collaborator}/ex-membros?page=${page}&limit=${limit}`,
    { method: "GET", headers: { Authorization: `Bearer ${token}` } },
  );
  if (response.status !== 200) {
    throw new Error("Erro ao buscar ex-membros");
  }
  return response.json();
}
