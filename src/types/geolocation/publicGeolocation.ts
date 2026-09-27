import { TypeMarker } from "../map/marker";

/**
 * O que o `GET /geo/public` devolve (tickets/022, card 01): cursinhos e
 * universidades **aprovados**, só com os campos públicos. Não tem `user*`,
 * `logs`, `report*` nem `status` — quem precisa disso é o dash, pelo
 * `GET /geo` protegido (`Geolocation`).
 */
export interface PublicGeolocation {
  id: string;
  type: TypeMarker;
  name: string;
  alias: string | null;
  campus: string | null;
  category: string | null;
  latitude: number;
  longitude: number;
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string | null;
  complement: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  email2: string | null;
  site: string | null;
  linkedin: string | null;
  youtube: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  createdAt: string;
  updatedAt: string;
}
