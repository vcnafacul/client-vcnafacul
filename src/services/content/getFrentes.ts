/* eslint-disable @typescript-eslint/no-explicit-any */
import { FrenteDto } from "../../dtos/content/contentDtoInput";
import { Materias } from "../../enums/content/materias";
import { FormFieldOptionFrente } from "../../pages/dashContent/modals/settingsContent";
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

export async function getFrenteLikeFormField( materia: Materias, token: string): Promise<FormFieldOptionFrente[]> {
    const frentes = await getFrentes(materia, token)

    const form = frentes.map((frente: any) => (
        { value: frente.id, label: frente.name, canDelete: frente.lenght === 0}
    ))
    return form
}
