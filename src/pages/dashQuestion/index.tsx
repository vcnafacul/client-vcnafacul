import { useCallback, useEffect, useRef, useState } from "react"
import DashCardTemplate from "../../components/templates/dashCardTemplate"
import { Question } from "../../dtos/question/QuestionDTO"
import { getAllQuestions } from "../../services/question/getAllQuestion"
import { useAuthStore } from "../../store/auth"
import { StatusEnum } from "../../enums/generic/statusEnum"
import { getInfosQuestion } from "../../services/question/getInfosQuestion"
import { InfoQuestion } from "../../types/question/infoQuestion"
import { CardDashInfo } from "../../components/molecules/cardDash"
import { formatDate } from "../../utils/date"
import { dashQuest } from "./data"
import Filter from "../../components/atoms/filter"
import Select from "../../components/atoms/select"
import ModalTabTemplate from "../../components/templates/modalTabTemplate"
import ModalDetalhes from "./modals/modalDetalhes"
import { updateQuestion } from "../../services/question/updateQuestion"
import { UpdateQuestion } from "../../dtos/question/updateQuestion"
import { toast } from "react-toastify"
import { updateStatus } from "../../services/question/updateStatus"
import { mergeObjects } from "../../utils/mergeObjects"
import Button from "../../components/molecules/button"
import { Roles } from "../../enums/roles/roles"

function DashQuestion() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [status, setStatus] = useState<StatusEnum>(StatusEnum.Pending);
    const [openModalEdit, setOpenModalEdit] = useState<boolean>(false);
    const [openModalRegister, setOpenModalRegister] = useState<boolean>(false);
    const [questionSelect, setQuestionSelect] = useState<Question | null>(null)
    const [page, setPage] = useState<number>(1)
    const dataRef = useRef<Question[]>([])

    const [infosQuestion, setInfosQuestion] = useState<InfoQuestion>({
        provas: [],
        materias: [],
        frentes: [],
        exames: []
    } as InfoQuestion)


    const { data: { token, permissao }} = useAuthStore()

    const cardQuestion : CardDashInfo[] = questions.map(question => (
        {cardId: question._id, isLast: questions[questions.length - 1]._id === question._id , title: question.title, status: question.status, infos: 
            [
                { field:"Id", value: question._id },
                { field:"Prova", value: infosQuestion.provas.find(infos => infos._id === question.prova)?.nome ?? question.prova },
                { field:"Área", value: question.enemArea},
                { field:"Disciplina", value: infosQuestion.materias.find(infos => infos._id === question.materia)?.nome ?? question.materia},
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

    const handleRemoveQuestion = (id: string) => {
        const newQuestions = questions.filter(q => q._id != id)
        setQuestions(newQuestions)
    }

    const handleAddQuestion = (questionUpdate: Question) => {
        dataRef.current.push(questionUpdate)
        setQuestions(dataRef.current)
    }

    const handleUpdateQuestion = (questionUpdate: UpdateQuestion) => {
        updateQuestion(questionUpdate, token)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .then(_ => {
                const newQuestions = questions.map((question) => {
                    if(question._id == questionUpdate._id){
                        return mergeObjects(questionUpdate, question)
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

    const handleUpdateQuestionStatus = (status: StatusEnum, message?: string) => {
        if(!questionSelect?.prova && status === StatusEnum.Approved) {
            toast.info('Não é possível aprovar questões sem referenciar uma prova. Selecione uma prova, salve o cadastro e tente novamente')
        }
        else {
            updateStatus(questionSelect!._id, status, token, message)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .then(_ => {
                handleRemoveQuestion(questionSelect!._id)
                setOpenModalEdit(false)
                toast.success(`Questão ${questionSelect!._id} atualizada com sucesso. Status: ${status === StatusEnum.Approved ? 'Aprovado' : 'Reprovado'} `)
            }).catch((error: Error) => {
                toast.error(error.message)
            })
        }
    }

    const onClickCard = (cardId: number | string) => {
        setQuestionSelect(questions.find(quest => quest._id === cardId)!)
        setOpenModalEdit(true)
    }

    const getQuestions = (status: StatusEnum, page: number) => {
        console.log('getQuestion', page)
        getAllQuestions(token, status, page)
        .then((res) => {
                setQuestions(questions.concat(res))
                setPage(page)
                dataRef.current = res
            })
            .catch((erro: Error) => {
                toast.error(erro.message)
            })
    }

    const getInfors = useCallback(async () => {
        getInfosQuestion(token)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((infos: any) => {
                setInfosQuestion(infos)
            })
            .catch((erro: Error) => {
                toast.error(erro.message)
            })
    }, [token])

    useEffect(() => {
        getQuestions(status, page)
    },[status])

    useEffect(() => {
        getInfors()
    }, [getInfors])

    const ModalEdit = () => {
        if(!openModalEdit) return null
        return <ModalTabTemplate 
            tabs={[
                { label: "Detalhes", 
                    children: <ModalDetalhes 
                        question={questionSelect!} 
                        infos={infosQuestion}
                        handleClose={() => { setOpenModalEdit(false) }}
                        handleUpdateQuestionStatus={handleUpdateQuestionStatus}
                        handleUpdateQuestion={handleUpdateQuestion}
                        handleAddQuestion={handleAddQuestion}
                         />}, 
                { label: "Historico", children: <>Teste 2</>}
            ]} />
    }

    const ModalRegister = () => {
        if(!openModalRegister) return null
        return <ModalTabTemplate 
            tabs={[
                { label: "Cadastro de Questao", 
                    children: <ModalDetalhes 
                        question={undefined} 
                        infos={infosQuestion} 
                        handleClose={() => { setOpenModalRegister(false) }}
                        handleUpdateQuestionStatus={handleUpdateQuestionStatus}
                        handleUpdateQuestion={handleUpdateQuestion}
                        handleAddQuestion={handleAddQuestion}
                         />}, 
                { label: "Cadastro de Prova", children: <>Teste 2</>}
            ]} />
    }
    return (
        <>
            <DashCardTemplate 
                cardlist={cardQuestion} 
                onClickCard={onClickCard} 
                title={dashQuest.title} 
                onLoadMoreCard={() => { getQuestions(status, page + 1) }}
                filterList={[
                    <Filter placeholder="id | texto" filtrar={handleInputChange}/>,
                    <Select options={dashQuest.options}  defaultValue={status}  setState={setStatus} />,
                    <Button disabled={!permissao[Roles.criarQuestao]} onClick={() => { setQuestionSelect(null); setOpenModalRegister(true) }} typeStyle="quaternary" 
                    className="text-xl font-light rounded-full h-8 "><span className="text-4xl">+</span>Cadastrar Questao</Button>
                    // <Select options={filters} defaultValue={Order.Increasing} setState={handleOrderChange} />
                ]} />
            <ModalEdit />
            <ModalRegister />
        </>

    )
}

export default DashQuestion