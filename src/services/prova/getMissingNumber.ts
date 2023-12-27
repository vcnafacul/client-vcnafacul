import fetchWrapper from "../../utils/fetchWrapper";
import { missing } from "../urls";

export async function getMissingNumber (prova: string, token: string): Promise<number[]> {
    const response = await fetchWrapper(`${missing}/${prova}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    const res = await response.json()
    if(response.status !== 200){
        throw new Error(`Erro ao buscar Numeros faltantes da prova ${res.message}`)
    }
    return res
}
