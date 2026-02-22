 
import { FrenteDto } from "../../dtos/content/contentDtoInput";
import { Materias } from "../../enums/content/materias";
import { Frente } from "../../types/content/frenteContent";
import fetchWrapper from "../../utils/fetchWrapper";
import { frentes, frentesByMateria, frentesByMateriaWithContent } from "../urls";

export async function getFrentesByMateria ( materia: Materias, token: string): Promise<FrenteDto[]> {
    const response = await fetchWrapper(`${frentesByMateria}/${materia}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Conteúdos Cadastradas ${res.message}`)
    }
    return res
}

export async function getFrentesWithContent ( materia: Materias, token: string): Promise<Frente[]> {
    const response = await fetchWrapper(`${frentesByMateriaWithContent}/${materia}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Conteúdos Cadastradas ${res.message}`)
    }
    return res
}


/** Normaliza um item da API para FrenteDto (id string de id ou _id, name de name ou nome) */
function normalizeFrente(item: Record<string, unknown>): FrenteDto {
  const rawId = item.id ?? item._id;
  const id = rawId != null ? String(rawId) : "";
  const name = (item.name ?? item.nome ?? "") as string;
  const materia = (item.materia ?? 0) as FrenteDto["materia"];
  const lenght = typeof item.lenght === "number" ? item.lenght : (item.length ?? 0) as number;
  const createdAt = item.createdAt instanceof Date ? item.createdAt : new Date((item.createdAt as string) ?? "");
  const subjects = Array.isArray(item.subjects) ? item.subjects as FrenteDto["subjects"] : [];
  return { id, name, materia, lenght, createdAt, subjects };
}

export async function getFrentes(token: string): Promise<FrenteDto[]> {
  const response = await fetchWrapper(`${frentes}?page=1&limit=1000`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar Conteúdos Cadastradas ${res.message}`);
  }
  const rawData = res.data ?? res;
  const list = Array.isArray(rawData) ? rawData : [];
  return list.map((item: Record<string, unknown>) => normalizeFrente(item));
}