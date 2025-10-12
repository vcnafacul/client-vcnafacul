 
import fetchWrapper from "../../utils/fetchWrapper";
import { frentes } from "../urls";

export async function deleteFrente ( id: string, token: string): Promise<void> {
    const response = await fetchWrapper(`${frentes}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    if(response.status !== 200){
        const res = await response.json()
        throw new Error(`Erro ao buscar Conteúdos Cadastradas ${res.message}`)
    }
}
