import { AuthUpdate } from "../../store/auth";
import fetchWrapper from "../../utils/fetchWrapper";
import { user } from "../urls";

export async function updateUser(token: string, data: AuthUpdate): Promise<void> {
    const response = await fetchWrapper(`${user}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
    });

    if(response.status !== 200){
        throw new Error(`Erro ao buscar Infos Usuário`)
    }
}
