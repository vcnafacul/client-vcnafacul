import { ChangeOrderDTO } from "../../dtos/content/changeOrder";
import fetchWrapper from "../../utils/fetchWrapper";
import { content } from "../urls";

export async function changeOrderDemand (token: string, body: ChangeOrderDTO){
    const response = await fetchWrapper(`${content}/order`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
    });
    if(response.status !== 200){
        const res = await response.json()
        throw new Error(`Erro ao tentar alterar orderm conteúdos - ${res.message}`)
    }
}