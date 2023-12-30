
import { ContentDtoInput } from "../../dtos/content/contentDtoInput";
import { StatusContent } from "../../enums/content/statusContent";
import fetchWrapper from "../../utils/fetchWrapper";
import { content } from "../urls";

export async function getContent (token: string, status: StatusContent, subjectId?: number): Promise<ContentDtoInput[]> {
    const subject = subjectId ? `&subjectId=${subjectId}` : ''
    const response = await fetchWrapper(`${content}?status=${status}${subject}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Conteúdos Cadastradas ${res.message}`)
    }
    return res
}

export async function getContentOrder (token: string, status: StatusContent, subjectId?: number): Promise<ContentDtoInput[]> {
    const subject = subjectId ? `&subjectId=${subjectId}` : ''
    const response = await fetchWrapper(`${content}/order?status=${status}${subject}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Conteúdos Cadastradas ${res.message}`)
    }
    return res
}
