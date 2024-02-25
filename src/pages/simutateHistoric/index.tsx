import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AlternativeHistorico } from "../../components/molecules/alternativeHistorico";
import { HeaderSimulateHistorico } from "../../components/organisms/headerSimulateHistorico";
import SimulateTemplate from "../../components/templates/simulateTemplate";
import { AnswerHistoricoDTO, HistoricoDTO, QuestaoHistorico } from "../../dtos/historico/historicoDTO";
import { QuestionBoxStatus } from "../../enums/simulado/questionBoxStatus";
import { getHistoricoSimuladoById } from "../../services/historico/getHistoricoSimuladoById";
import { useAuthStore } from "../../store/auth";
import { simulateMetricData } from "./data";

export function SimulateHistoric() {
    const { historicId } = useParams();
    const [historic, setHistoric] = useState<HistoricoDTO | null>(null)
    const [answerSelected, setAnswerSelected] = useState<AnswerHistoricoDTO | null>(null)
    const [questionSelected, setQuestionSelected] = useState<QuestaoHistorico | null>(null)

    const { data: { token }} = useAuthStore()


    const getStatus = (answer: AnswerHistoricoDTO) => {
        if(answer.questao === questionSelected?._id) return QuestionBoxStatus.active
        else if(!answer.alternativaEstudante) return QuestionBoxStatus.unread;
        else if(answer.alternativaCorreta === answer.alternativaEstudante) return QuestionBoxStatus.isRight;
        return QuestionBoxStatus.solved;
    }

    const selectQuestion = (index: number) => {
        const questionSelected = historic!.simulado.questoes[index]
        setQuestionSelected(questionSelected)
        setAnswerSelected(historic!.respostas.find(r => r.questao === questionSelected._id)!)
    }

    useEffect(() => {
        if(!historicId) {
            toast.error('historico ID precisa ser diferente de nulo')
        }
        else {
            getHistoricoSimuladoById(token, historicId)
                .then(res => {
                    setHistoric(res)
                    setQuestionSelected(res.simulado.questoes[0])
                    setAnswerSelected(res!.respostas[0])
                })
                .catch((error: Error) => {
                    toast.error(error.message)
                })
        }

    }, [token])
    
    if(!historic) return <></>
    return ( 
        <SimulateTemplate
            header={<HeaderSimulateHistorico historic={historic} />}
            selectQuestion={selectQuestion}
            questions={historic.simulado.questoes.map((q, index) => ({id: q._id, number: index, status: getStatus(historic.respostas.find(r => r.questao === q._id)!)}))}
            legends={simulateMetricData.legends}
            questionSelect={questionSelected!}
            alternative={<AlternativeHistorico answer={answerSelected!} />}
            buttons={[]}
            expandedPhoto={() => {}}
        />
     );
}