import { Auth } from "../../store/auth";
import fetchWrapper from "../../utils/fetchWrapper";
import { userRoute } from "../urls";

export async function me(token: string): Promise<Auth> {
    const response = await fetchWrapper(`${userRoute}/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Infos Usuário`)
    }
    
    return res
}
