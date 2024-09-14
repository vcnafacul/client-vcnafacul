import fetchWrapper from "../../utils/fetchWrapper";
import { content } from "../urls";


export async function resetDemand(id: string,  token: string) : Promise<boolean>{
    const response = await fetchWrapper(`${content}/reset/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    if(response.status === 304 || response.status === 200) {
        return true
    }
    else {
        throw new Error("Erro ao tentar resetar demanda");
    }
}