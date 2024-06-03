import { HistoricoDTO } from "../../dtos/historico/historicoDTO";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { historico } from "../urls";

export async function getAllHistoricoSimulado(
  token: string,
  page: number = 1,
  limit: number = 40
): Promise<Paginate<HistoricoDTO>> {
  const url = new URL(historico);
  const params: Record<string, string | number> = {
    page,
    limit,
  };
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key].toString())
  );
  const response = await fetchWrapper(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error("Erro ao buscar historico de simulados");
  }

  return await response.json();
}
