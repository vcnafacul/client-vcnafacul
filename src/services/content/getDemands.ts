
import { ContentDtoInput } from "../../dtos/content/contentDtoInput";
import fetchWrapper from "../../utils/fetchWrapper";
import { demand } from "../urls";

export async function getDemands (token: string): Promise<ContentDtoInput[]> {
    const response = await fetchWrapper(demand, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Demandas Cadastradas ${res.message}`)
    }
    return res
}
