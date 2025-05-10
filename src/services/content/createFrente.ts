import { CreateFrenteDtoInput, CreateFrenteDtoOutput } from "../../dtos/content/frenteDto";
import fetchWrapper from "../../utils/fetchWrapper";
import {  frentes } from "../urls";

export async function createFrente(data: CreateFrenteDtoInput, token: string): Promise<CreateFrenteDtoOutput> {
    const response = await fetchWrapper(frentes, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    const res = await response.json()
    if(response.status !== 201){
        if(response.status >= 400) {
            throw res
        }
    }
    return res
}