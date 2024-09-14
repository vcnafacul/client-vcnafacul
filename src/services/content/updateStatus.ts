import { StatusContent } from "../../enums/content/statusContent";
import { StatusEnum } from "../../enums/generic/statusEnum";
import fetchWrapper from "../../utils/fetchWrapper";
import { content } from "../urls";


export async function updateStatus(id: string, status: StatusContent | StatusEnum, token: string) : Promise<boolean>{
    const response = await fetchWrapper(`${content}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({id, status}),
    });
    if(response.status === 304 || response.status === 200) {
        return true
    }
    else {
        throw new Error("Erro ao tentar atualizar status de conteúdo");
    }
}