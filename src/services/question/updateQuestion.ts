
import { UpdateQuestion } from "../../dtos/question/updateQuestion";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateQuestion (questao: UpdateQuestion, token: string):Promise<any> {
    questao = fixQuestion(questao)
    const response = await fetchWrapper(questoes, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(questao)
    });
    if(response.status !== 200){
        const res = await response.json()
        throw new Error(`Erro ao atualizar questão - ${res.message}`)
    }
}

const fixQuestion = (questao: UpdateQuestion) => {
    if(questao.numero) questao.numero = parseInt(questao.numero as unknown as string)
    return questao
}
