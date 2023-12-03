/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import RadioButton from "../../../components/atoms/radioButton";
import Text from "../../../components/atoms/text"
import Button from "../../../components/molecules/button"
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { ReportDTO } from "../../../dtos/audit/reportDto";
import { ReportEntity } from "../../../enums/audit/reportEntity";
import { radios } from "../data";
import { reportSimulado } from "../../../services/simulado/reportSimulado";
import { useAuthStore } from "../../../store/auth";

interface ModalReportProblemProps extends ModalProps{
    questionProblem: boolean;
    numberQuestion?: number;
    idQuestion?: string;
}

function ModalReportProblem({ handleClose, questionProblem, numberQuestion, idQuestion} : ModalReportProblemProps) {
    const [selectedOption, setSelectedOption] = useState<number>(0);
    const [message, setMessage] = useState<string>('')

    const { data: { token }} = useAuthStore()

    const sendReport = () => {
        if(message.length > 0) {
            // setError(false)
            const body : ReportDTO = {
                entity: questionProblem ? ReportEntity.Questao : ReportEntity.Simulado,
                entityId: questionProblem ? idQuestion as string : "",
                message: `[${questionProblem ? 
                    selectedOption === 1 ? radios.question.first : radios.question.second :
                    selectedOption === 1 ? radios.platform.first : radios.platform.second
                    }] - ${message}`
            }
            reportSimulado(body, token)
                .finally(() => {
                    handleClose()
                })
        }
    }

    const IsQuestionProblem = () => {
        return questionProblem ? 
            <div>
                <Text size="tertiary" className="text-start text-grey">Foi um problema com a questão, <span style={{fontSize: "16px", color: "#000", fontWeight: "bolder"}}>[ {numberQuestion} ]</span> ?</Text>
                <div className="flex gap-4">
                    <RadioButton onChange={ () => setSelectedOption(0)} checked={selectedOption === 0}>{radios.question.first}</RadioButton>
                    <RadioButton onChange={ () => setSelectedOption(1)} checked={selectedOption === 1}>{radios.question.second}</RadioButton>
                </div>
            </div>:
            <div>
                <Text size="tertiary" className="text-start text-grey m-0">Foi um bug recorrente ou um bug que ocorreu de maneira esporádica?*</Text>
                <div className="flex gap-4">
                    <RadioButton onChange={ () => setSelectedOption(0)} checked={selectedOption === 0}>{radios.platform.first}</RadioButton>
                    <RadioButton onChange={ () => setSelectedOption(1)} checked={selectedOption === 1}>{radios.platform.second}</RadioButton>
                </div>
            </div>
    }

    return (
        <ModalTemplate>
            <div className="bg-white max-w-5xl p-10 rounded">
                <Text size="secondary" className="text-start">Ocorreu algum problema?</Text>
                <Text size="tertiary" className="text-start text-grey">Nos desculpe pelo transtorno, por favor, nos informe mais sobre o problema para a melhoria contínua da plataforma.</Text>
                <IsQuestionProblem />
                <textarea className="w-full border h-20 py-2 px-4" onChange={(event: any) => setMessage(`${event.target.value}`)}/>
                <div className="max-w-3xl flex mx-auto gap-4 mt-4">
                    <Button hover typeStyle="secondary" onClick={handleClose}> Cancelar </Button>
                    <Button disabled={message.length <= 0} hover onClick={sendReport}> Reportar </Button>
                </div>
            </div>
        </ModalTemplate>
    )
}

export default ModalReportProblem