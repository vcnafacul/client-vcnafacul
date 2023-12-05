
import { News } from "../../dtos/news/news";
import { news } from "../urls";

export async function createNews(data: FormData, token: string): Promise<News>{
    const res = await fetch(news, {
        method: "POST",
        headers: { 
            Authorization: `Bearer ${token}`,
         },
        body: data,
    });
    const response = await res.json()
    if(res.status === 200) return response
    throw new Error(`Erro ao tentar criar novidades - ${response.message}`)
}