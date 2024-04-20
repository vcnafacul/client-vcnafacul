import { Auth } from "../../store/auth";
import fetchWrapper from "../../utils/fetchWrapper";
import { user } from "../urls";

export async function me(token: string): Promise<Auth> {
    const response = await fetchWrapper(`${user}/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Infos Usuário`)
    }
    
    return res
}
