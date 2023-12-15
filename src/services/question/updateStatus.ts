
import { StatusEnum } from "../../types/generic/statusEnum";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

export async function updateStatus (id: string, status: StatusEnum, token: string, message?: string,): Promise<boolean> {
    const response = await fetchWrapper(`${questoes}/${id}/${status}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
    });
    console.log(message)
    if(response.status !== 200){
        const res = await response.json()
        throw new Error(`Erro ao editar status da questão! - ${res.message}`)
    }
    return true
}
