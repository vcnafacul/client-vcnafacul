import { content_snapshot_status } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface SnapshotContentStatus {
  snapshot_date: Date;
  pendentes: number;
  aprovados: number;
  reprovados: number;
  pendentes_upload: number;
  total: number;
}

export async function getContentSnapshotContentStatus(
  token: string
): Promise<SnapshotContentStatus[]> {
  const response = await fetchWrapper(content_snapshot_status, {
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
