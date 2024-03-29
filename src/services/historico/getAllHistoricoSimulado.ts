
import { HistoricoDTO } from "../../dtos/historico/historicoDTO";
import fetchWrapper from "../../utils/fetchWrapper";
import { historico } from "../urls";

export async function getAllHistoricoSimulado(token: string) : Promise<HistoricoDTO[]> {
    const response = await fetchWrapper(historico, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if(response.status !== 200){
        throw new Error('Erro ao buscar historico de simulados')
    }
    return await response.json()
}