
import { News } from "../../dtos/news/news";
import { news } from "../urls";

export async function getNews(): Promise<News[]>{
    const res = await fetch(news, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if(res.status !== 200){
        throw new Error('Erro ao Recuperar Novidades')
    }
    return await res.json()
}