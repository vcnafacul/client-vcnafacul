export interface AddressResponse {
  address: {
    road: string;
    state: string;
    city: string;
    postcode: string;
    suburb: string;
    town: string;
  };

}

export async function getCepByLatAndLon(lat: number, lon: number) : Promise<AddressResponse> {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}
  `)

  return await response.json()
}