import { StatusEnum } from "../../enums/generic/statusEnum";
import { Geolocation } from "../../types/geolocation/geolocation";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { allGeolocation } from "../urls";

export async function getAllGeolocation(
    status: StatusEnum,
    page: number = 1,
    limit: number = 40,
    text: string = ''
  ): Promise<Paginate<Geolocation>> {

    const url = new URL(allGeolocation);
    const params : Record<string, string | number> = { status, text, page, limit }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key].toString()))

    const res = await fetchWrapper(url.toString(), {
        headers: { "Content-Type": "application/json" },
    });

    if(res.status !== 200) {
      return {
          data: [] as Geolocation[],
          page: 1,
          limit: 0,
          totalItems: 0
      }
  }

    return await res.json()
}
