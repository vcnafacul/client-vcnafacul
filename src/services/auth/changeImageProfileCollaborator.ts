import fetchWrapper from "../../utils/fetchWrapper";
import { userRoute } from "../urls";

export async function changeImageProfileCollaborator(data: FormData, token: string) : Promise<string> {
    const response = await fetchWrapper(`${userRoute}/collaborator`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
    });
    const res = await response.text()
    if(response.status !== 201){
        throw new Error('Erro ao atulizar informacões')
    }
    return res
}