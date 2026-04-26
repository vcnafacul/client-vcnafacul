import { getVolunteers } from "../../../services/auth/getVolunteers";

export interface Volunteer {
  id: string | number;
  name: string;
  role: string;
  imageKey: string | null;
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
      imageKey: v.image || null,
    }));
}
