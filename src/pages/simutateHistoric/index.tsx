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
import { Alternatives } from "../../types/question/alternative";
import { simulateMetricData } from "./data";
import { HistoricoMock } from "./mock";

export function SimulateHistoric() {
    const { historicId } = useParams();
    const [historic, setHistoric] = useState<HistoricoDTO | null>(null)

    const { data: { token }} = useAuthStore()

    const [questionSelected] = useState<QuestaoHistorico>(HistoricoMock.simulado.questoes[3])

    const getStatus = (answer: AnswerHistoricoDTO) => {
        if(!answer.alternativaEstudante) return QuestionBoxStatus.unread;
        else if(answer.alternativaCorreta === answer.alternativaEstudante) return QuestionBoxStatus.isRight;
        return QuestionBoxStatus.solved;
    }

    const alternativeDiv = () => {
        const resposta = HistoricoMock.respostas.find(r => r.questao === questionSelected._id)
        return (
            <div className="flex gap-4">
                {Alternatives.map((alt, index) => (
                    <AlternativeHistorico answer={resposta!}
                        key={index} label={alt.label} select={resposta?.alternativaEstudante === alt.label} />
                ))}
            </div>
        )
    }

    useEffect(() => {
        if(!historicId) {
            toast.error('historico ID precisa ser diferente de nulo')
        }
        else {
            console.log(historicId)
            getHistoricoSimuladoById(token, historicId)
                .then(res => {
                    setHistoric(res)
                })
                .catch((error: Error) => {
                    toast.error(error.message)
                })
        }
    }, [])

    if(!historic) return <></>
    return ( 
        <SimulateTemplate
            header={<HeaderSimulateHistorico />}
            selectQuestion={() => {}}
            questions={historic.simulado.questoes.map((q, index) => ({id: q._id, number: index, status: getStatus(HistoricoMock.respostas.find(r => r.questao === q._id)!)}))}
            legends={simulateMetricData.legends}
            questionSelect={questionSelected}
            alternative={alternativeDiv()}
            buttons={[]}
            expandedPhoto={() => {}}
        />
     );
}