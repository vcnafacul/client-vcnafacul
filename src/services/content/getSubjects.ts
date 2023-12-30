import { SubjectDto } from "../../dtos/content/contentDtoInput";
import { FormFieldOptionSubject } from "../../pages/dashContent/modals/settingsContent";
import fetchWrapper from "../../utils/fetchWrapper";
import { subjectsByFrente } from "../urls";

export async function getSubjects ( frenteId: number, token: string): Promise<SubjectDto[]> {
    const response = await fetchWrapper(`${subjectsByFrente}/${frenteId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Conteúdos Cadastradas ${res.message}`)
    }
    return res
}


export async function getSubjectsLikeFormField( frenteId: number, token: string): Promise<FormFieldOptionSubject[]> {
    const subjects = await getSubjects(frenteId, token)

    const form : FormFieldOptionSubject[] = subjects.map((subject: SubjectDto) => (
        { value: subject.id, label: subject.name, canDelete: subject.lenght === 0, description: subject.description}
    ))
    return form
}