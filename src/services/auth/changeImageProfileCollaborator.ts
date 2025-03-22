import fetchWrapper from "../../utils/fetchWrapper";
import { collaborator } from "../urls";

export async function changeImageProfileCollaborator(data: FormData, token: string) : Promise<string> {
    const response = await fetchWrapper(`${collaborator}/photo`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
    });
    const res = await response.text()
    if(response.status !== 200){
        throw new Error('Erro ao atulizar informacões')
    }
    return res
}