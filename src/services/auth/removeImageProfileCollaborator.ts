import fetchWrapper from "../../utils/fetchWrapper";
import { user } from "../urls";

export async function removeImageProfileCollaborator(token: string) : Promise<boolean> {
    const response = await fetchWrapper(`${user}/collaborator`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error('Erro ao tentar deletar imagem de usuário' + res.message)
    }
    return res
}