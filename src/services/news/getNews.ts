
import { News } from "../../dtos/news/news";
import fetchWrapper from "../../utils/fetchWrapper";
import { news } from "../urls";

export async function getNews(): Promise<News[]>{
    const res = await fetchWrapper(news, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if(res.status !== 200){
        throw new Error('Erro ao Recuperar Novidades')
    }
    return await res.json()
}