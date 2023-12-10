import { Question, QuestionDto } from "../../dtos/question/QuestionDTO"
import { StatusEnum } from "../../types/generic/statusEnum"
import fetchWrapper from "../../utils/fetchWrapper"
import { questoes } from "../urls"

export async function getAllQuestions(token: string, status: StatusEnum) : Promise<Question[]> {
    const response = await fetchWrapper(`${questoes}/${status}`,  {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    if(response.status === 200) {
        const questoes : QuestionDto[] = await response.json()
        return questoes.map((questao: QuestionDto) => (
            {
                title: `${questao.caderno} ${questao.ano} ${questao.numero}`,
                ...questao
            }
        ))
    }
    return []
}