import { FrenteDto } from "@/dtos/content/contentDtoInput";
import fetchWrapper from "../../utils/fetchWrapper";
import { materias } from "../urls";

export interface MateriaDto {
  _id: string;
  nome: string;
  enemArea: string;
  icon?: string;
  image?: string;
  frentes: FrenteDto[];
}

export async function getMaterias(token: string): Promise<MateriaDto[]> {
  const response = await fetchWrapper(`${materias}?page=1&limit=100`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar matérias: ${res.message}`);
  }
  return res.data ?? res;
}
