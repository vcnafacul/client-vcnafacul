import { useState } from "react";
import { useParams } from "react-router-dom";
import { AlternativeHistorico } from "../../components/molecules/alternativeHistorico";
import { HeaderSimulateHistorico } from "../../components/organisms/headerSimulateHistorico";
import SimulateTemplate from "../../components/templates/simulateTemplate";
import { AnswerHistoricoDTO, QuestaoHistorico } from "../../dtos/historico/historicoDTO";
import { QuestionBoxStatus } from "../../enums/simulado/questionBoxStatus";
import { Alternatives } from "../../types/question/alternative";
import { simulateMetricData } from "./data";
import { HistoricoMock } from "./mock";

export function SimulateHistorico() {

    // const { historicId } = useParams();

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

    return ( 
        <SimulateTemplate
            header={<HeaderSimulateHistorico />}
            selectQuestion={() => {}}
            questions={HistoricoMock.simulado.questoes.map((q, index) => ({id: q._id, number: index, status: getStatus(HistoricoMock.respostas.find(r => r.questao === q._id)!)}))}
            legends={simulateMetricData.legends}
            questionSelect={questionSelected}
            alternative={alternativeDiv()}
            buttons={[]}
            expandedPhoto={() => {}}
        />
     );
}