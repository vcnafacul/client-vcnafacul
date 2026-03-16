export interface PlacesDetailsOutput {
  placeId?: string;

  name?: string;
  category?: string;

  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;

  phone?: string;
  site?: string;

  formattedAddress?: string;

  lat?: number;
  lng?: number;
}