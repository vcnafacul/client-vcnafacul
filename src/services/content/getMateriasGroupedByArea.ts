import fetchWrapper from "../../utils/fetchWrapper";
import { materias } from "../urls";

export interface MateriaGroupedItem {
  _id: string;
  nome: string;
  icon?: string;
  image?: string;
}

export interface AreaWithMaterias {
  enemArea: string;
  materias: MateriaGroupedItem[];
}

export async function getMateriasGroupedByArea(): Promise<AreaWithMaterias[]> {
  const response = await fetchWrapper(`${materias}/grouped-by-area`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar matérias agrupadas: ${res.message}`);
  }
  return res;
}
