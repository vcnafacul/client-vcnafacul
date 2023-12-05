
import { News } from "../../dtos/news/news";
import { news } from "../urls";

export async function createNews(data: FormData, token: string): Promise<News>{
    try {
        const res = await fetch(news, {
            method: "POST",
            headers: { 
                Authorization: `Bearer ${token}`,
             },
            body: data,
        });
        const response = await res.json()
        console.log(response)
        if(res.status === 200) return response
        throw new Error(`Erro ao criar - ${response}`)
    } catch (error) {
        console.error(error)
        throw error
    }
}