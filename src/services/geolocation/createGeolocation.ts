import { CreateGeolocation, Geolocation } from "../../types/geolocation/geolocation";
import { geolocations } from "../urls";

export async function createGeolocation(data: CreateGeolocation) : Promise<Geolocation> {
  const response = await fetch(geolocations, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (response.status === 201) {
    return await response.json();
  }

  const errorBody = await response.text();
  throw new Error(
    `Falha ao criar geolocalização. Status: ${response.status}. Corpo da resposta: ${errorBody}`
  );
}
