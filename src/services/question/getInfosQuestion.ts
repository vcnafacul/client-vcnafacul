import { questoes } from "../urls"

export async function getInfosQuestion(token: string) {
    const response = await fetch(`${questoes}/infos`,  {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    if(response.status === 200) {
        return await response.json()
    }
    throw new Error(`${response.status} - Erro ao buscar infos`)
}