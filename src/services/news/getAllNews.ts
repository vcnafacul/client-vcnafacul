import { News } from "../../dtos/news/news";
import { newsAll } from "../urls";

export async function getAllNews(token: string): Promise<News[]>{
    const res = await fetch(newsAll, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if(res.status !== 200){
        throw new Error('Erro ao Recuperar Novidades')
    }
    return await res.json()
}