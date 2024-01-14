import { CreateGeolocation } from "../../types/geolocation/geolocation";
import { geolocations } from "../urls";

export async function createGeolocation( data: CreateGeolocation ) {
  const response = await fetch(geolocations, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return await response.json()
}