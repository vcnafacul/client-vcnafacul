
import { News } from "../../dtos/news/news";
import fetchWrapper from "../../utils/fetchWrapper";
import { news } from "../urls";

export async function createNews(data: FormData, token: string): Promise<News>{
    try {
        const res = await fetchWrapper(news, {
            method: "POST",
            headers: { 
                Authorization: `Bearer ${token}`,
             },
            body: data,
        });
        const response = await res.json()
        if(res.status === 201) return response
        console.log(response)
        throw new Error(`Erro ao tentar criar novidades - ${response.message}`)
    } catch (error) {
        console.log(error)
        throw error
    }
}