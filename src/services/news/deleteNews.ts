import { news } from "../urls";

export async function deleteNews(id: number, token: string): Promise<void>{
    const res = await fetch(`${news}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if(res.status !== 200){
        throw new Error('Erro ao Deletar Novidades')
    }
}