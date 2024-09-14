/* eslint-disable @typescript-eslint/no-explicit-any */
import fetchWrapper from "../../utils/fetchWrapper";
import { content } from "../urls";


export async function uploadFileDemand(id: string, data: FormData, token: string) : Promise<boolean>{
    const response = await fetchWrapper(`${content}/upload/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
    });
    if(response.status === 304 || response.status === 201) {
        return true
    }
    else {
        throw new Error("Erro ao tentar enviar arquivo de conteúdo");
    }
}