import IconArea from "../../components/atoms/iconArea";
import HeaderSimulate from "../../components/molecules/headerSimulate";
import QuestionList from "../../components/molecules/questionList";
import DashTemplate from "../../components/templates/dashTemplate"
import { QuestionBoxStatus } from "../../enums/simulado/questionBoxStatus";
import { headerDash } from "../dash/data"

import Text from "../../components/atoms/text";
import Button from "../../components/molecules/button";

import { ReactComponent as Linguagem } from '../../assets/images/dashboard/linguagens.svg'
import {  ReactComponent as Report } from '../../assets/icons/warning.svg'
import Alternative from "../../components/atoms/alternative";
import { Alternativa, useSimuladoStore } from "../../store/simulado";
import Legends from "../../components/molecules/legends";
import { simulateData } from "./data";

function Simulate() {
    const { data, setActive, setAnswer, nextQuestion, confirm, priorQuestion, isFinish, setFinish } = useSimuladoStore()

    const questionSelect = data.questions[data.questionActive]

    return (
        <DashTemplate header={headerDash}>
            <div className="flex flex-col">
                <HeaderSimulate simulateName="ENEM" onClick={() => {}}/>
                <QuestionList 
                    questions={[{id: 1, number: 1, status: QuestionBoxStatus.active}, {id: 2, number: 2, status: QuestionBoxStatus.unread}]} />
                <Legends legends={simulateData.legends}/>
                <div className="container mx-auto">
                    <div className="flex items-center gap-4">
                        <div> <IconArea icon={Linguagem} className="bg-marine" /> </div>
                        <Text className="m-0">Linguagem</Text>
                        <Button typeStyle="none" size="none"><Report className="w-15 h-15" /></Button>
                    </div>
                    <div className="flex my-8 flex-col items-start">
                        <Text size="secondary" className="text-orange">Questao 1</Text>
                        <div className="w-full flex justify-center">
                            <img className="max-w-5xl h-96" src={`https://api.vcnafacul.com.br/images/1bxcTw6HFHltK3DGzbIyinJd2raTX8f9K.png`} />
                        </div>
                    </div>
                    <div className="flex justify-between flex-col md:flex-row gap-4">
                        <div className="flex gap-4 justify-center items-center">
                            <Text size="secondary" className="text-orange w-60 text-start m-0">{simulateData.alternativeText}</Text>
                            {simulateData.alternativasData.map(alt => (
                                <Alternative label={alt.label} select={Alternativa.A === alt.alternative} />

                            ))}
                        </div>
                        <div className="flex gap-4 justify-center items-center">
                            <Button typeStyle="secondary" hover className="w-44">Voltar</Button>
                            <Button hover className="w-44">Pular</Button>
                            <Button className="bg-green3 border-green3 w-44 hover:border-green2 hover:bg-green2 transition-all duration-300">Confirmar</Button>
                        </div>
                    </div>
                </div> 
            </div>
        </DashTemplate>
    )
}

export default Simulate