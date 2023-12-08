
import { StatusEnum } from "../../types/generic/statusEnum";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

export async function updateStatus (id: string, status: StatusEnum, token: string, message?: string,): Promise<boolean> {
    const res = await fetchWrapper(`${questoes}/${id}/${status}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
    });
    if(res.status !== 200){
        console.log(message)
        throw new Error('Erro ao editar status da questão!')
    }
    return true
}
