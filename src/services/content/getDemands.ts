
import { ContentDtoInput } from "../../dtos/content/contentDtoInput";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { demand } from "../urls";

export async function getDemands (token: string, page: number = 1, limit: number = 40): Promise<Paginate<ContentDtoInput>> {
    const response = await fetchWrapper(`${demand}?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Demandas Cadastradas ${res.message}`)
    }
    return res
}
