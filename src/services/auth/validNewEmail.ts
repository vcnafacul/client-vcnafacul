import { StatusCodes } from "http-status-codes";
import fetchWrapper from "../../utils/fetchWrapper";
import { user } from "../urls";

export async function validNewEmail(email: string): Promise<void> {
    const response = await fetchWrapper(`${user}/hasemail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
    if(response.status === StatusCodes.BAD_REQUEST){
        throw new Error(`Email Já existe`)
    }
    if(response.status === StatusCodes.INTERNAL_SERVER_ERROR){
        throw new Error(`Erro ao tentar cadastrar, tente mais tarde ou entre em contato conosco`)
    }
    return await response.json()
}
