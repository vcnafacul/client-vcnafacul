import fetchWrapper from "../../utils/fetchWrapper";
import { userRoute } from "../urls";

export async function removeImageProfileCollaborator(token: string) : Promise<boolean> {
    const response = await fetchWrapper(`${userRoute}/collaborator`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error('Erro ao tentar deletar imagem de usuário' + res.message)
    }
    return res
}