
import { AvailableSimuladoDto } from "../../dtos/simulado/availableSimuladoDto";
import fetchWrapper from "../../utils/fetchWrapper";
import { simulado } from "../urls";

export async function getAvailable(tipo: string, token: string) : Promise<AvailableSimuladoDto[]> {
    const response = await fetchWrapper(`${simulado}/available?tipo=${tipo}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if(response.status !== 200){
        throw new Error('Erro ao buscar simulados disponíveis')
    }
    return await response.json()
}