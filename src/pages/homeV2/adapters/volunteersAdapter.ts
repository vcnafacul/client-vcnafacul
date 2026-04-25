import { getVolunteers } from "../../../services/auth/getVolunteers";

export interface Volunteer {
  id: string | number;
  name: string;
  role: string;
  imageKey: string; // S3 key, not URL
}

export const volunteersFallback: Volunteer[] = [];

export async function fetchVolunteers(): Promise<Volunteer[]> {
  const res = await getVolunteers();
  return (res ?? [])
    .filter((v) => v.actived !== false && v.image)
    .map((v, i) => ({
      id: i,
      name: v.name,
      role: v.description,
      imageKey: v.image,
    }));
}
