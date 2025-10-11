 
import { FrenteDto } from "../../dtos/content/contentDtoInput";
import { Materias } from "../../enums/content/materias";
import { Frente } from "../../types/content/frenteContent";
import fetchWrapper from "../../utils/fetchWrapper";
import { frentesByMateria, frentesByMateriaWithContent } from "../urls";

export async function getFrentes ( materia: Materias, token: string): Promise<FrenteDto[]> {
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
