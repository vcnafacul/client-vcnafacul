import { StatusEnum } from "../../enums/generic/statusEnum";
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
  status: StatusEnum,
  page: number = 1,
  limit: number = 40,
  text: string = "",
): Promise<Paginate<Geolocation>> {
  const url = new URL(allGeolocation);
  const params: Record<string, string | number> = { status, text, page, limit };
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
