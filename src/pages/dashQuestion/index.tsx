import { useCallback, useEffect, useRef, useState } from "react"
import DashCardTemplate from "../../components/templates/dashCardTemplate"
import { Question } from "../../dtos/question/QuestionDTO"
import { getAllQuestions } from "../../services/question/getAllQuestion"
import { useAuthStore } from "../../store/auth"
import { StatusEnum } from "../../types/generic/statusEnum"
import { headerDash } from "../dash/data"
import { getInfosQuestion } from "../../services/question/getInfosQuestion"
import { InfoQuestion } from "../../types/question/infoQuestion"
import { CardDashInfo } from "../../components/molecules/cardDash"
import { formatDate } from "../../utils/date"
import { Order, dashQuest, filters } from "./data"
import Filter from "../../components/atoms/filter"
import Select from "../../components/atoms/select"
import ModalTabTemplate from "../../components/templates/modalTabTemplate"
import ModalDetalhes from "./modals/modalDetalhes"
import { updateQuestion } from "../../services/question/updateQuestion"
import { UpdateQuestion } from "../../dtos/question/updateQuestion"
import { toast } from "react-toastify"
import { updateStatus } from "../../services/question/updateStatus"

function DashQuestion() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [status, setStatus] = useState<StatusEnum>(StatusEnum.Pending);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [questionSelect, setQuestionSelect] = useState<Question>()
    const dataRef = useRef<Question[]>([])

    const [infosQuestion, setInfosQuestion] = useState<InfoQuestion>({
        exames: [],
        materias: [],
        frentes: []
    } as InfoQuestion)


    const { data: { token }} = useAuthStore()

    const cardQuestion : CardDashInfo[] = questions.map(question => (
        {cardId: question._id, title: question._id, status: question.status, infos: 
            [
                { field:"Id", value: question._id },
                { field:"Exame", value: question.exame.nome },
                { field:"Edicao", value: question.edicao },
                { field:"Ano", value: question.ano.toString()},
                { field:"Área", value: question.enemArea},
                { field:"Disciplina", value: question.materia.nome},
                { field:"Ultima Atulizacao", value: question.updateAt ? formatDate(question.updateAt.toString()) : ""},
            ]
        }
    ))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputChange = (event: any) => {
        const filter = event.target.value.toLowerCase();
        if(!filter) setQuestions(dataRef.current)
        else setQuestions(dataRef.current.filter(q => q._id.includes(filter) || q.textoQuestao.toLowerCase().includes(filter)))
    }

    const handleOrderChange = (opt: Order) => {
        if(opt === Order.Increasing) {
            setQuestions(questions.sort((a, b) => 
                a.textoQuestao.toLocaleLowerCase().localeCompare(b.textoQuestao.toLocaleLowerCase())))
        }  else {
            setQuestions(questions.sort((a, b) => 
                b.textoQuestao.toLocaleLowerCase().localeCompare(a.textoQuestao.toLocaleLowerCase())))
        }
    }

    const handleRemoveQuestion = (id: string) => {
        const newQuestions = questions.filter(q => q._id != id)
        setQuestions(newQuestions)
    }

    const handleUpdateQuestion = (questionUpdate: UpdateQuestion) => {
        updateQuestion(questionUpdate, token)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .then(_ => {
                const newQuestions = questions.map((question) => {
                    if(question._id == questionUpdate._id){
                        return questionUpdate
                    }
                    return question
                });
                setQuestions(newQuestions as Question[])
                toast.success(`Questao ${questionUpdate._id} atualizada com sucesso`)
            })
            .catch((error: Error) => {
                toast.error(error.message)
            });
    }

    const handleUpdateQuestionStatus = (status: StatusEnum) => {
        updateStatus(questionSelect!._id, status, token)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .then(_ => {
            handleRemoveQuestion(questionSelect!._id)
            setOpenModal(false)
            toast.success(`Questão ${questionSelect!._id} atualizada com sucesso. Status: ${status === StatusEnum.Approved ? 'Aprovado' : 'Reprovado'} `)
        }).catch((error: Error) => {
            toast.error(error.message)
        })
    }

    const onClickCard = (cardId: number | string) => {
        setQuestionSelect(questions.find(quest => quest._id === cardId))
        setOpenModal(true)
    }

    const getQuestions = useCallback(async (status: StatusEnum) => {
        getAllQuestions(token, status)
            .then((res) => {
                setQuestions(res)
                dataRef.current = res
            })
            .catch(erro => {
                console.error(erro)
            })
    }, [token])

    const getInfors = useCallback(async () => {
        getInfosQuestion(token)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((infos: any) => {
                setInfosQuestion(infos)
            })
            .catch((erro) => {
                console.error(erro)
            })
    }, [])

    useEffect(() => {
        getQuestions(status)
    },[status, getQuestions])

    useEffect(() => {
        getInfors()
    }, [getInfors])

    const ModalEdit = () => {
        if(!openModal) return null
        return <ModalTabTemplate 
            tabs={[
                { label: "Detalhes", 
                    children: <ModalDetalhes 
                        question={questionSelect!} 
                        infos={infosQuestion} 
                        handleClose={() => { setOpenModal(false) }}
                        handleUpdateQuestionStatus={handleUpdateQuestionStatus}
                        handleUpdateQuestion={handleUpdateQuestion}
                         />}, 
                { label: "Historico", children: <>Teste 2</>}
            ]} />
    }

    return (
        <>
            <DashCardTemplate 
                header={headerDash} 
                cardlist={cardQuestion} 
                onClickCard={onClickCard} 
                title={dashQuest.title} 
                filterList={[
                    <Filter placeholder="id | texto" filtrar={handleInputChange}/>,
                    <Select options={dashQuest.options}  defaultValue={status}  setState={setStatus} />,
                    <Select options={filters} defaultValue={Order.Increasing} setState={handleOrderChange} />
                ]} />
            <ModalEdit />
        </>

    )
}

export default DashQuestion