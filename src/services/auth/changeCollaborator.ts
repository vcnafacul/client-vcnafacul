import fetchWrapper from "../../utils/fetchWrapper";
import { user } from "../urls";

export async function changeCollaborator(userId: string, collaborator: boolean, description: string | null | undefined, token: string) {
    const res = await fetchWrapper(`${user}/collaborator`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, description, collaborator }),
    });

    if(res.status !== 200){
        throw new Error('Erro ao atulizar informacões')
    }
}