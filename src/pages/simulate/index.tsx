import IconArea from "../../components/atoms/iconArea";
import HeaderSimulate from "../../components/molecules/headerSimulate";
import QuestionList from "../../components/molecules/questionList";
import { QuestionBoxStatus } from "../../enums/simulado/questionBoxStatus";

import Text from "../../components/atoms/text";
import Button from "../../components/molecules/button";

import { ReactComponent as Report } from '../../assets/icons/warning.svg'
import Alternative from "../../components/atoms/alternative";
import { Answer, AnswerSimulado, useSimuladoStore } from "../../store/simulado";
import Legends from "../../components/molecules/legends";
import { simulateData } from "./data";
import { getIconByTitle } from "../dashSimulate/data";
import { ModalType } from "../../types/simulado/modalType";
import { useEffect, useState } from "react";
import { answerSimulado } from "../../services/simulado/answerSimulado";
import { useNavigate } from "react-router-dom";
import { DASH_SIMULADO } from "../../routes/path";
import { useAuthStore } from "../../store/auth";
import ModalInfo from "./modals/modalInfo";
import ModalReportProblem from "./modals/ModalReportProblem";
import { toast } from "react-toastify";

function Simulate() {
    const { data, setActive, setAnswer, nextQuestion, confirm, priorQuestion, isFinish, setFinish } = useSimuladoStore()
    const navigate = useNavigate()
    const [tryFinish, setTryFinish] = useState<boolean>(false)
    const [reportModal, setReportModal] = useState<boolean>(false)
    const [reportProblem, setReportProblem] = useState<boolean>(false)
    const [questionProblem, setQuestionProblem] = useState<boolean>(false)

    const { data: { token } }= useAuthStore()

    const questionSelect = data.questions[data.questionActive]

    const getStatus = (viewed: boolean, resolved: boolean, actived: boolean) => {
        if(actived) return QuestionBoxStatus.active;
        else if(resolved) return QuestionBoxStatus.solved;
        else if(viewed) return QuestionBoxStatus.unsolved;
        return QuestionBoxStatus.unread;
    }

    const Encerrar = () => {
        const res : Answer[] = data.questions
            .filter(q => !!q.answered)
            .map(q => {
                return {
                    questao: q._id,
                    alternativaEstudante: q.answered!
                }
            })
        const body : AnswerSimulado = {
            idSimulado: data._id,
            respostas: res
        }
        answerSimulado(body, token)
            .finally(() => {
                navigate(DASH_SIMULADO)
            })
    }

    const finalize = () => {
        confirm()
        isFinish()
        const solvedCount = 
            data.questions.reduce((acc, obj) => obj.solved ? acc + 1 : acc, 0);
        if(solvedCount + 1 === data.questions.length) {
            setTryFinish(true);
          }
    }

    const dataModal : ModalType[] = [
        {
            show: !data.finish! && tryFinish && !reportModal, 
            title: "Deseja realmente finalizar seu simulado?", 
            subTitle: "Você não respondeu todas as questões", 
            buttons: [
                {
                    onClick: () => setTryFinish(false),
                    type: 'secondary',
                    children: "Nao"
                },
                {
                    onClick: () => setFinish(),
                    children: "Sim"
                }
            ]
        },
        {
            show: data.finish! && tryFinish && !reportModal,
            title: "Parabens!!! Ocorreu tudo certo com seu simulado?", 
            subTitle: "Reporte possíveis erros ou traga sugestões para a contínua melhoria da plataforma", 
            buttons: [
                {
                    onClick: Encerrar,
                    children: "Confirmar e Enviar"
                },
                {
                    onClick: () => setReportModal(true),
                    type: "secondary",
                    children: <>Reportar problema <Report className="w-6 h-6 group-hover:h-10" /></>
                }
            ]
        },
        {
            show: reportModal && tryFinish,
            title: "Qual tipo de problema gostaria de reportar?", 
            subTitle: "ocorreu algum problema com alguma questão especifica ou um bug na plataforma?", 
            buttons: [
                {
                    onClick: () => setTryFinish(false),
                    type: "secondary",
                    children: <>Reportar questão <Report className="w-6 h-6 group-hover:h-8 transition-all duration-300" /></>
                },
                {
                    onClick: () => {
                        setQuestionProblem(false)
                        setReportProblem(true)
                    },
                    type: "secondary",
                    children: <>Bug na plataforma <Report className="w-6 h-6 group-hover:h-8 transition-all duration-300" /></>
                },
                {
                    onClick: () => setReportModal(false),
                    children: "Voltar"
                }
            ]
        }
    ]

    const FinishReport = () => {
        return dataModal.map((modal, index) => {
            if(modal.show) 
                return <ModalInfo key={index} modal={modal} />
            else return null
        })
    }

    const ReportProblem = () => {
        if(!reportProblem) return null
        return <ModalReportProblem questionProblem={questionProblem} idQuestion={questionSelect._id} numberQuestion={questionSelect.number + 1} handleClose={() => { setReportProblem(false) }} />
    }

    useEffect(() => {
        if(data.questions.length === 0) {
            navigate(DASH_SIMULADO)
            toast.warn('Não há Simulado a serem respondido', { theme: 'dark'})
        }
    })
    
    if(data.questions.length > 0)
        return (
        <>
                <div className="flex flex-col sm:mx-auto">
                    <HeaderSimulate simulateName={data.title} onClick={() => {setTryFinish(true)}}/>
                    <QuestionList selectQuestion={(number: number) => { setActive(number) }}
                        questions={data.questions.map(quest => ({id: quest._id, number: quest.number, status: getStatus(quest.viewed, quest.solved, data.questionActive === quest.number)}))} />
                    <Legends legends={simulateData.legends}/>
                    <div className="container mx-4 sm:mx-auto">
                        <div className="flex items-center gap-4">
                            <div> <IconArea icon={getIconByTitle(questionSelect.enemArea) as React.FunctionComponent<React.SVGProps<SVGSVGElement>> }  className="bg-marine" /> </div>
                            <Text className="m-0">{questionSelect.enemArea}</Text>
                            <Button typeStyle="none" size="none"><Report className="w-15 h-15" /></Button>
                        </div>
                        <div className="flex my-8 flex-col items-start">
                            <div className="flex justify-center items-center mb-8">
                                <Text size="secondary" className="text-orange m-0">Questao {questionSelect.number + 1}</Text>
                                <Report className="w-10 h-8" onClick={() => {setQuestionProblem(true); setReportProblem(true)}}/>
                            </div>
                            <div className="w-full flex justify-center">
                                <img className="max-w-5xl max-h-96 w-full mr-4 sm:m-0" src={`https://api.vcnafacul.com.br/images/${questionSelect.imageId}.png`} />
                            </div>
                        </div>
                        <div className="flex justify-between flex-col md:flex-row gap-4">
                            <div className="flex gap-4 justify-center items-center flex-wrap">
                                <Text size="secondary" className="text-orange w-60 text-start m-0">{simulateData.alternativeText}</Text>
                                <div className="flex gap-4">
                                    {simulateData.alternativasData.map((alt, index) => (
                                        <Alternative key={index} onClick={() => setAnswer(alt.label)} disabled={data.finish} label={alt.label} select={questionSelect.answered === alt.label} />

                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-4 justify-center items-center flex-col sm:flex-row mx-auto">
                                <Button onClick={priorQuestion} typeStyle="secondary" hover className="w-44">Voltar</Button>
                                <Button onClick={nextQuestion} hover className="w-44">Pular</Button>
                                <Button onClick={finalize} className="bg-green3 border-green3 w-44 hover:border-green2 hover:bg-green2 transition-all duration-300">Confirmar</Button>
                            </div>
                        </div>
                    </div> 
                </div>
            <FinishReport />
            <ReportProblem />
        </>
    )
}

export default Simulate