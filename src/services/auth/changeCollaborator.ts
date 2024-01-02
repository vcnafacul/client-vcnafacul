import fetchWrapper from "../../utils/fetchWrapper";
import { userRoute } from "../urls";

export async function changeCollaborator(userId: number, collaborator: boolean, description: string | null | undefined, token: string) {
    const res = await fetchWrapper(`${userRoute}/collaborator`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, description, collaborator }),
    });

    if(res.status !== 200){
        throw new Error('Erro ao atulizar informacões')
    }
}