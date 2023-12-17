import { Prova } from "../../dtos/prova/prova";
import fetchWrapper from "../../utils/fetchWrapper";
import { prova } from "../urls";

export async function createProva (data: FormData, token: string): Promise<Prova> {
    const response = await fetchWrapper(prova, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
    });
    if(response.status !== 201){
        const res = await response.json()
        if(response.status === 403) {
            throw new Error(res.message)
        }
    }
    return await response.json()
}
