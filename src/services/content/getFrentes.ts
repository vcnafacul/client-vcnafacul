import { FrenteDto } from "../../dtos/content/contentDtoInput";
import { Frente } from "../../types/content/frenteContent";
import fetchWrapper from "../../utils/fetchWrapper";
import { frentesByMateria, frentesByMateriaWithContent } from "../urls";

export async function getFrentes(materiaId: string, token: string): Promise<FrenteDto[]> {
    const response = await fetchWrapper(`${frentesByMateria}/${materiaId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Conteúdos Cadastradas ${res.message}`)
    }
    return res
}

export async function getFrentesWithContent(materiaId: string, token: string): Promise<Frente[]> {
    const response = await fetchWrapper(`${frentesByMateriaWithContent}/${materiaId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Conteúdos Cadastradas ${res.message}`)
    }
    return res
}
