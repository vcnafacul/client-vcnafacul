import { PlacesDetailsOutput } from "@/dtos/places/placesDetailsOutput";
import { placesDetails } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function getLocationInformationByPlaceId(
  token: string,
  placeId: string
): Promise<PlacesDetailsOutput> {
  const url = new URL(placesDetails);
  url.searchParams.append("placeId", placeId);

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
  
  return await res.json();
}