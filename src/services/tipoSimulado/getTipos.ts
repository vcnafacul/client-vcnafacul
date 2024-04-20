import { ITipoSimulado } from "../../dtos/simulado/tipoSimulado";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { tipos } from "../urls";

export async function getTipos(token: string) : Promise<Paginate<ITipoSimulado>> {
    const response = await fetchWrapper(`${tipos}?page=1&limit=0`,  {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    if(response.status === 200) {
        return await response.json()
    }
    throw new Error(`${response.status} - Erro ao buscar tipos de provas`)
}