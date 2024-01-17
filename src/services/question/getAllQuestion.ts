import { Question, QuestionDto } from "../../dtos/question/QuestionDTO"
import { StatusEnum } from "../../enums/generic/statusEnum"
import { Paginate } from "../../types/generic/paginate"
import fetchWrapper from "../../utils/fetchWrapper"
import { questoes } from "../urls"

export async function getAllQuestions(token: string, status: StatusEnum, page: number = 1, limit: number = 30) : Promise<Question[]> {
    const response = await fetchWrapper(`${questoes}/${status}?page=${page}&limit=${limit}`,  {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    if(response.status === 200) {
        const pageQuestions : Paginate<Question> = await response.json()
        return pageQuestions.data.map((questao: QuestionDto) => (
            {
                title: `${questao._id} ${questao.numero}`,
                ...questao
            }
        ))
    }
    return []
}