/* eslint-disable @typescript-eslint/no-explicit-any */
import { Volunteer } from "../../components/organisms/supporters";
import fetchWrapper from "../../utils/fetchWrapper";
import { collaborator } from "../urls";

export async function getVolunteers(): Promise<Volunteer[]> {
  const response = await fetchWrapper(
    `${collaborator}/${import.meta.env.VITE_VCNAFACUL_ID}/prepCourse`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  const res: any[] = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar Voluntários`);
  }
  const volunteers: Volunteer[] = res.map((col) => ({
    ...col,
    image: col.image,
    alt: `foto colaborador ${col.name}`,
  }));
  console.log(volunteers);
  return volunteers;
}
