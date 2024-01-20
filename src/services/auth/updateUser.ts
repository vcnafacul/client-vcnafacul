import { AuthUpdate } from "../../store/auth";
import fetchWrapper from "../../utils/fetchWrapper";
import { userRoute } from "../urls";

export async function updateUser(token: string, data: AuthUpdate): Promise<void> {
    const response = await fetchWrapper(`${userRoute}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    console.log(response.status)
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Infos Usuário`)
    }
}
