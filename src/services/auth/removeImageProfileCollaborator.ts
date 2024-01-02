import fetchWrapper from "../../utils/fetchWrapper";
import { userRoute } from "../urls";

export async function removeImageProfileCollaborator(token: string) : Promise<boolean> {
    const response = await fetchWrapper(`${userRoute}/collaborator`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log(response)
    const res = await response.json()
    console.log(res)
    if(response.status !== 200){
        throw new Error('Erro ao tentar deletar imagem de usuário' + res.message)
    }
    return res
}