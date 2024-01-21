import fetchWrapper from "../../utils/fetchWrapper";
import { userRoute } from "../urls";

export async function validNewEmail(email: string): Promise<void> {
    const response = await fetchWrapper(`${userRoute}/hasemail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
    if(response.status === 400){
        throw new Error(`Email Já existe`)
    }
}
