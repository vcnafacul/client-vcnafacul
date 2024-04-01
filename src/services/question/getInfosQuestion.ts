import fetchWrapper from "../../utils/fetchWrapper"
import { questoes } from "../urls"

export async function getInfosQuestion(token: string) {
    const response = await fetchWrapper(`${questoes}/infos`,  {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    if(response.status === 200) {
        return await response.json()
    }
    console.log(response)
    throw new Error(`${response.status} - Erro ao buscar infos`)
}