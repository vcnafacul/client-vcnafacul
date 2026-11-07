import {
  FILTROS_VAZIOS,
  FiltrosDoGeo,
  paraQuery,
} from "@/pages/dashGeo/filtros";
import { Geolocation } from "../../types/geolocation/geolocation";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { allGeolocation } from "../urls";

/**
 * Lista do dash de validação (`GET /geo`, com dados de quem cadastrou e logs).
 * ⚠️ Manda o token: o `GET /geo` vai exigir login com `validarCursinho`
 * (tickets/022, card 01b). O `fetchWrapper` não injeta o token sozinho.
 */
export async function getAllGeolocation(
  token: string,
  filtros: FiltrosDoGeo = FILTROS_VAZIOS,
  page: number = 1,
  limit: number = 40,
): Promise<Paginate<Geolocation>> {
  const url = new URL(allGeolocation);
  const params: Record<string, string | number> = {
    ...paraQuery(filtros),
    page,
    limit,
  };
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key].toString()),
  );

  const res = await fetchWrapper(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status !== 200) {
    return {
      data: [] as Geolocation[],
      page: 1,
      limit: 0,
      totalItems: 0,
    };
  }

  return await res.json();
}

/**
 * Todos os registros que casam com os filtros, página por página: a lista V2
 * ordena no navegador e precisa de tudo — com uma página só, quem passasse
 * de 100 sumia.
 */
export async function getTodasAsGeolocalizacoes(
  token: string,
  filtros: FiltrosDoGeo = FILTROS_VAZIOS,
  porPagina = 100,
): Promise<Geolocation[]> {
  const todas: Geolocation[] = [];
  for (let page = 1; ; page++) {
    const { data, totalItems } = await getAllGeolocation(
      token,
      filtros,
      page,
      porPagina,
    );
    todas.push(...data);
    if (data.length === 0 || todas.length >= totalItems) return todas;
  }
}
