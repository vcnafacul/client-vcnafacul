/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormFieldOptionSubject } from "../../pages/dashContent/modals/settingsContent";
import fetchWrapper from "../../utils/fetchWrapper";
import { subjectsByFrente } from "../urls";

export async function getSubjects ( frenteId: number, token: string): Promise<FormFieldOptionSubject[]> {
    const response = await fetchWrapper(`${subjectsByFrente}/${frenteId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Conteúdos Cadastradas ${res.message}`)
    }
    const form : FormFieldOptionSubject[] = res.map((subject: any) => (
        { value: subject.id, label: subject.name, canDelete: subject.lenght === 0, description: subject.description}
    ))
    return form
}
