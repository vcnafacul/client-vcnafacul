/* eslint-disable @typescript-eslint/no-explicit-any */
import { Volunteer } from "../../components/organisms/supporters";
import fetchWrapper from "../../utils/fetchWrapper";
import { collaborator } from "../urls";

const VCNAFACUL_ID = import.meta.env.VITE_VCNAFACUL_ID;

export async function getVolunteers(): Promise<Volunteer[]> {
  if (!VCNAFACUL_ID || String(VCNAFACUL_ID).trim() === "") {
    throw new Error(
      "VITE_VCNAFACUL_ID não está configurado. Defina no .env (local) ou no Secret do repositório (GitHub Actions)."
    );
  }
  const response = await fetchWrapper(
    `${collaborator}/${VCNAFACUL_ID}/prepCourse`,
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
  return volunteers;
}
