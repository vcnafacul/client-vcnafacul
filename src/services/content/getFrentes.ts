/* eslint-disable @typescript-eslint/no-explicit-any */
import { Materias } from "../../enums/content/materias";
import { FormFieldOptionDelete } from "../../pages/dashContent/modals/settingsContent";
import fetchWrapper from "../../utils/fetchWrapper";
import { frentesByMateria } from "../urls";

export async function getFrentes ( materia: Materias, token: string): Promise<FormFieldOptionDelete[]> {
    const response = await fetchWrapper(`${frentesByMateria}/${materia}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Conteúdos Cadastradas ${res.message}`)
    }
    const form = res.map((frente: any) => (
        { value: frente.id, label: frente.name, canDelete: frente.lenght === 0}
    ))
    return form
}
