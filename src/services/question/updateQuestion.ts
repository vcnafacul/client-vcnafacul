
import { UpdateQuestion } from "../../dtos/question/updateQuestion";
import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateQuestion (questao: UpdateQuestion, token: string):Promise<any> {
    questao = fixQuestion(questao)
    console.log(questao)
    const res = await fetchWrapper(questoes, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(questao)
    });
    console.log(res)
    if(res.status !== 200){
        console.log(await res.json())
        throw new Error(`Erro ao atualizar questão.`)
    }
}

const fixQuestion = (questao: UpdateQuestion) => {
    if(questao.ano) questao.ano = parseInt(questao.ano as unknown as string)
    if(questao.numero) questao.numero = parseInt(questao.numero as unknown as string)
    return questao
}
