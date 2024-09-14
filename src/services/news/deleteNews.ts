import fetchWrapper from "../../utils/fetchWrapper";
import { news } from "../urls";

export async function deleteNews(id: string, token: string): Promise<void>{
    const res = await fetchWrapper(`${news}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if(res.status !== 200){
        throw new Error('Erro ao Deletar Novidades')
    }
}