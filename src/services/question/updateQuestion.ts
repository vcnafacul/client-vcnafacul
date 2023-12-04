
import { UpdateQuestion } from "../../dtos/question/updateQuestion";
import { questoes } from "../urls";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateQuestion (questao: UpdateQuestion, token: string):Promise<any> {
    const res = await fetch(questoes, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(questao)
    });
    if(res.status !== 200){
        throw new Error(`Erro ao atualizar questão.`)
    }
}
