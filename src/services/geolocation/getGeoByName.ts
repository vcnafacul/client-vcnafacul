import { geolocations } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface SearchGeo {
  id: string;
  name: string;
}

export async function getGeoByName(
  token: string,
  name: string
): Promise<SearchGeo[]> {
  const url = new URL(`${geolocations}/search-geo-by-name`);
  url.searchParams.set("name", name);

  const res = await fetchWrapper(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status !== 200) {
    throw new Error("Erro ao buscar geolocalização");
  }
  return (await res.json()) as SearchGeo[];
}
