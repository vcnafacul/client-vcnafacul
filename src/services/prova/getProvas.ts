import { Prova } from "../../dtos/prova/prova";
import fetchWrapper from "../../utils/fetchWrapper";
import { prova } from "../urls";

export async function getProvas (token: string): Promise<Prova[]> {
    const response = await fetchWrapper(prova, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Provas Cadastradas ${res.message}`)
    }
    return res
}
