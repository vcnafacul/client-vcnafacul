import { ISimuladoDTO } from "../../dtos/simulado/simuladoDto";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { simulado } from "../urls";

export async function getSimulados(token: string, page: number = 1, limit: number = 40) : Promise<Paginate<ISimuladoDTO>> {
    const response = await fetchWrapper(`${simulado}?page=${page}&limit=${limit}`,  {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    if(response.status !== 200){
        throw new Error('Erro ao buscar simulado')
    }
    return await response.json()
}