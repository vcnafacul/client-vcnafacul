import fetchWrapper from "../../utils/fetchWrapper";
import { simulado } from "../urls";

export async function getSimulados(token: string) {
    const response = await fetchWrapper(`${simulado}/`,  {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    if(response.status !== 200){
        throw new Error('Erro ao buscar simulado')
    }
    return await response.json()
}