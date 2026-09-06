import { enrolled } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { GridFilterItem, GridSortModel } from "@mui/x-data-grid";

/**
 * Baixa a listagem de matriculados em XLSX.
 *
 * Recebe os mesmos filtros da tela — sem `page`/`limit`, porque o arquivo traz
 * a lista filtrada inteira e nao a pagina visivel. O backend monta a planilha
 * e ja aplica a mascara de email, telefone e CPF conforme a permissao.
 */
export async function exportStudentsEnrolled(
  token: string,
  inscriptionId?: string,
  filters?: GridFilterItem,
  sortModel?: GridSortModel,
  year?: number,
  applicationStatus?: string,
  columns?: string[]
): Promise<void> {
  const url = new URL(`${enrolled}/export`);
  const params: Record<string, string | number> = {};

  // sem `columns`, o backend cai na selecao padrao — as mesmas colunas fixas
  // de antes do seletor
  if (columns?.length) {
    params["columns"] = columns.join(",");
  }

  if (filters) {
    params["filter[field]"] = filters.field;
    params["filter[value]"] = filters.value;
    params["filter[operator]"] = filters.operator;
  }

  if (sortModel && sortModel.length > 0) {
    params["sort[field]"] = sortModel[0].field;
    params["sort[order]"] = sortModel[0].sort as string;
  }

  if (inscriptionId) {
    params["inscriptionId"] = inscriptionId;
  }

  if (year !== undefined) {
    params["year"] = year;
  }

  if (applicationStatus) {
    params["applicationStatus"] = applicationStatus;
  }

  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key].toString())
  );

  const response = await fetchWrapper(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 403) {
    throw new Error(
      "Seu perfil não tem permissão para exportar alguma das colunas escolhidas."
    );
  }

  if (response.status === 429) {
    throw new Error(
      "Muitos downloads seguidos. Aguarde alguns minutos e tente de novo."
    );
  }

  if (!response.ok) {
    let message = "Erro ao exportar a lista de estudantes";
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // corpo da resposta nao e JSON
    }
    throw new Error(message);
  }

  // o nome vem do Content-Disposition, que o backend monta com os filtros
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const fileName = match
    ? decodeURIComponent(match[1])
    : `estudantes-${new Date().toISOString().slice(0, 10)}.xlsx`;

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
