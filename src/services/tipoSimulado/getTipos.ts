import fetchWrapper from "../../utils/fetchWrapper";
import { tipos } from "../urls";

export async function getTipos(token: string) {
    const response = await fetchWrapper(tipos,  {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    if(response.status === 200) {
        return await response.json()
    }
    throw new Error(`${response.status} - Erro ao buscar tipos de provas`)
}