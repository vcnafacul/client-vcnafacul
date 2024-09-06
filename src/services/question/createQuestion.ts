import { StatusCodes } from "http-status-codes";
import { Question } from "../../dtos/question/questionDTO";
import { CreateQuestion } from "../../dtos/question/updateQuestion";
import { cleanObject } from "../../utils/cleanObjet";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

export async function createQuestion (data: CreateQuestion, token: string): Promise<Question> {
    data.numero = parseInt(data.numero as unknown as string)
    const response = await fetchWrapper(questoes, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(cleanObject(data)),
    });

    if(response.status !== StatusCodes.CREATED){
        let errorMessage = 'Erro ao tentar criar questão - '
        if(response.status >= StatusCodes.BAD_REQUEST) {
            errorMessage += (await response.json()).message as string
        }
        throw new Error(errorMessage)
    }
    return await response.json()
}
