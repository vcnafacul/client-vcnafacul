/* eslint-disable @typescript-eslint/no-explicit-any */
import { Question, QuestionDto } from "../../dtos/question/questionDTO"
import { StatusEnum } from "../../enums/generic/statusEnum"
import fetchWrapper from "../../utils/fetchWrapper"
import { Paginate } from "../../utils/paginate"
import { questoes } from "../urls"

export async function getAllQuestions(token: string, status: StatusEnum, text: string = '',
    page: number = 1, limit: number = 40, materia: string = '', frente: string = '', 
    prova: string = '', enemArea: string = '') : Promise<Paginate<Question>> {
    const url = new URL(questoes);

    const params : { [key: string] : any } = { status, text, page, limit, materia, frente, prova, enemArea }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    const response = await fetchWrapper(url.toString(),  {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    if(response.status === 200) {
        const questoes : Paginate<Question> = await response.json()
        return {
            data: questoes.data.map((questao: QuestionDto) => (
                {
                    title: `${questao._id} ${questao.numero}`,
                    ...questao
                }
            )),
            page,
            limit,
            totalItems: questoes.totalItems
        }
    }
    throw new Error(`Erro ao tentar recuperar questões - Pagina ${page}`)
}