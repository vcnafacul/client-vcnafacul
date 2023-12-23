import { UpdateFrenteDtoOutut } from "../../dtos/content/frenteDto";
import fetchWrapper from "../../utils/fetchWrapper";
import {  frentes } from "../urls";

export async function updateFrente(data: UpdateFrenteDtoOutut, token: string): Promise<void> {
    const response = await fetchWrapper(frentes, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });

    if(response.status !== 200){
        if(response.status >= 400) {
            const res = await response.json()
            throw new Error(res)
        }
    }
}