import { enrolled } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface ExportColumn {
  key: string;
  label: string;
  group: string;
  /** O valor virá mascarado: o papel do usuário não vê este campo em claro. */
  masked: boolean;
  /** Faz parte da seleção padrão (as colunas fixas de antes do seletor). */
  default: boolean;
}

/**
 * Catálogo das colunas que ESTE usuário pode exportar.
 *
 * Vem do backend em vez de ser uma lista local: duas listas divergiriam sem
 * erro de compilação, e a regra de permissão tem que valer no servidor de
 * qualquer forma — o modal é conveniência de UI, não controle de acesso.
 */
export async function getExportColumns(
  token: string
): Promise<ExportColumn[]> {
  const response = await fetchWrapper(`${enrolled}/export/columns`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error("Erro ao buscar as colunas disponíveis");
  }

  return await response.json();
}
