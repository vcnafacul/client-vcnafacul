import { SubjectDto } from "../../dtos/content/contentDtoInput";
import fetchWrapper from "../../utils/fetchWrapper";
import { subjectsByFrente } from "../urls";

export async function getSubjects ( frenteId: string, token: string): Promise<SubjectDto[]> {
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