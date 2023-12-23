import { CreateFrenteDtoInput, CreateFrenteDtoOutput } from "../../dtos/content/frenteDto";
import fetchWrapper from "../../utils/fetchWrapper";
import {  frentes } from "../urls";

export async function createFrente(data: CreateFrenteDtoOutput, token: string): Promise<CreateFrenteDtoInput> {
    const response = await fetchWrapper(frentes, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    const res = await response.json()
    if(response.status !== 201){
        if(response.status === 400) {
            throw new Error(res)
        }
    }
    return res
}