import fetchWrapper from "@/utils/fetchWrapper";
import { geolocations } from "../urls";

/*
  "Informação correta" de um cursinho (tickets/022, cards 03 e 09). Exige
  login; token explícito no header, como o getGeoByName.
*/

const cabecalhos = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function confirmGeo(token: string, id: string): Promise<void> {
  const res = await fetchWrapper(`${geolocations}/${id}/confirmation`, {
    method: "POST",
    headers: cabecalhos(token),
  });
  if (!res.ok) throw new Error("Não foi possível confirmar a informação");
}

export async function unconfirmGeo(token: string, id: string): Promise<void> {
  const res = await fetchWrapper(`${geolocations}/${id}/confirmation`, {
    method: "DELETE",
    headers: cabecalhos(token),
  });
  if (!res.ok) throw new Error("Não foi possível desfazer a confirmação");
}

/** Ids dos cursinhos que EU confirmei (e ainda valem). */
export async function getMyConfirmations(token: string): Promise<string[]> {
  const res = await fetchWrapper(`${geolocations}/confirmation/me`, {
    headers: cabecalhos(token),
  });
  if (!res.ok) throw new Error("Não foi possível carregar suas confirmações");
  return res.json();
}
