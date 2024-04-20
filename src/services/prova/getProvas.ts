import { Prova } from "../../dtos/prova/prova";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { prova } from "../urls";

export async function getProvas (token: string, page: number = 1, limit: number = 1): Promise<Paginate<Prova>> {
    const response = await fetchWrapper(`${prova}?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Provas Cadastradas ${res.message}`)
    }
    return res
}
