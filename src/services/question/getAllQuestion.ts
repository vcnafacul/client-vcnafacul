import { Question, QuestionDto } from "../../dtos/question/QuestionDTO"
import { StatusEnum } from "../../types/generic/statusEnum"
import { questoes } from "../urls"

export async function getAllQuestions(token: string, status: StatusEnum) : Promise<Question[]> {
    const response = await fetch(`${questoes}/${status}`,  {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    if(response.status === 200) {
        const questoes : QuestionDto[] = await response.json()
        return questoes.map((questao: QuestionDto) => (
            {
                title: `${questao.exame.nome} ${questao.ano} ${questao.numero}`,
                ...questao
            }
        ))
    }
    return []
}