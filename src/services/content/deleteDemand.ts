/* eslint-disable @typescript-eslint/no-explicit-any */
import fetchWrapper from "../../utils/fetchWrapper";
import { content } from "../urls";

export async function deleteDemand
 ( id: string, token: string): Promise<void> {
    const response = await fetchWrapper(`${content}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    if(response.status !== 200){
        const res = await response.json()
        throw new Error(`Erro ao buscar Conteúdos Cadastradas ${res.message}`)
    }
}
