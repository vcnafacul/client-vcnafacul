
import { StatusEnum } from "../../types/generic/statusEnum";
import { questoes } from "../urls";

export async function updateStatus (id: string, status: StatusEnum, token: string): Promise<boolean> {
    const res = await fetch(`${questoes}/${id}/${status}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
    });
    if(res.status !== 200){
        throw new Error('Erro ao editar status da questão!')
    }
    return true
}
