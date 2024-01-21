
import { StatusEnum } from "../../enums/generic/statusEnum";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

export async function updateStatus (id: string, status: StatusEnum, token: string, message?: string): Promise<boolean> {
    console.log(message)
    const response = await fetchWrapper(`${questoes}/${id}/${status}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message })
    });
    if(response.status !== 200){
        const res = await response.json()
        throw new Error(`Erro ao editar status da questão! - ${res.message}`)
    }
    return true
}