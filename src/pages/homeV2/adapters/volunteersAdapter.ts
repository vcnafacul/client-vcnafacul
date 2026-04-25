// client-vcnafacul/src/pages/homeV2/adapters/volunteersAdapter.ts
import { getVolunteers } from "../../../services/auth/getVolunteers";

export interface Volunteer {
  id: string | number;
  name: string;
  role: string;
  photoUrl: string;
}

export const volunteersFallback: Volunteer[] = [];

export async function fetchVolunteers(): Promise<Volunteer[]> {
  const res = await getVolunteers();
  return (res ?? [])
    .filter((v) => v.actived !== false)
    .map((v, i) => ({
      id: i,
      name: v.name,
      role: v.description,
      photoUrl: v.image,
    }));
}
