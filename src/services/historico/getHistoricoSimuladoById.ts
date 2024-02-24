
import { HistoricoDTO } from "../../dtos/historico/historicoDTO";
import fetchWrapper from "../../utils/fetchWrapper";
import { historico } from "../urls";

export async function getHistoricoSimuladoById(token: string, historicId: string) : Promise<HistoricoDTO> {
    const response = await fetchWrapper(`${historico}/${historicId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    console.log(`getHistoricoSimuladoById`, response.status)
    if(response.status !== 200){
        throw new Error(`Erro ao buscar historico de simulado ${historicId}`)
    }
    return await response.json()
}