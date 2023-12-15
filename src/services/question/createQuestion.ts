import { CreateQuestion } from "../../dtos/question/updateQuestion";
import { cleanObject } from "../../utils/cleanObjet";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

export async function createQuestion (data: CreateQuestion, token: string): Promise<string> {
    data.ano = parseInt(data.ano as unknown as string)
    data.numero = parseInt(data.numero as unknown as string)
    const response = await fetchWrapper(questoes, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(cleanObject(data)),
    });
    if(response.status !== 201){
        if(response.status === 400) {
            throw new Error(await response.json())
        }
    }
    return await response.json()
}
