import { content_stats_by_frente } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface ContentStatsByFrente {
  materia: number;
  frente: string;
  pendentes: number;
  aprovados: number;
  reprovados: number;
  pendentes_upload: number;
  total: number;
}

export async function getContentSummary(
  token: string
): Promise<ContentStatsByFrente[]> {
  const response = await fetchWrapper(content_stats_by_frente, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar informações de monitoramento de conteúdos`);
  }

  return res;
}
