import { IQuestao, ISimuladoDTO } from "../../dtos/simulado/simuladoDto";
import { Question, Simulado } from "../../store/simulado";
import { toAnswer } from "../urls";

function mapIQuestaoToQuestion(questao: IQuestao, index: number): Question {
    return {
      _id: questao._id,
      imageId: questao.imageId,
      exam: questao.exame, // Se a propriedade exame for { $oid: string }
      year: questao.ano,
      book: questao.caderno,
      enemArea: questao.enemArea,
      materia: questao.materia.nome, // Se a propriedade materia for { $oid: string }
      number: index,
      solved: false,
      viewed: false
    };
  }

export async function getSimuladoById(id: string, token: string ) {
    try {
        const response = await fetch(`${toAnswer}/${id}`,  {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        })
        if(response.status !== 200){
            throw new Error(`Erro ao buscar simulado`)
        }
        const res: ISimuladoDTO = await response.json()
        console.log(res)
        const payload : Simulado = {
            _id: res._id,
            nQuestion: res.questoes.length,
            questions: res.questoes.map(mapIQuestaoToQuestion),
            title: res.nome,
            started: res.inicio,
            questionActive: 0,
            duration: res.duracao,
            finish: false,
            finished: new Date()
        }
        return payload
    } catch (error) {
        console.error(error)
        throw error
    }
}