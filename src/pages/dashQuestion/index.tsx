import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import Filter from "../../components/atoms/filter"
import Select from "../../components/atoms/select"
import Button from "../../components/molecules/button"
import { CardDash } from "../../components/molecules/cardDash"
import DashCardTemplate from "../../components/templates/dashCardTemplate"
import ModalTabTemplate from "../../components/templates/modalTabTemplate"
import { Question } from "../../dtos/question/questionDTO"
import { UpdateQuestion } from "../../dtos/question/updateQuestion"
import { StatusEnum } from "../../enums/generic/statusEnum"
import { Roles } from "../../enums/roles/roles"
import { getAllQuestions } from "../../services/question/getAllQuestion"
import { getInfosQuestion } from "../../services/question/getInfosQuestion"
import { updateQuestion } from "../../services/question/updateQuestion"
import { updateStatus } from "../../services/question/updateStatus"
import { useAuthStore } from "../../store/auth"
import { InfoQuestion } from "../../types/question/infoQuestion"
import { formatDate } from "../../utils/date"
import { mergeObjects } from "../../utils/mergeObjects"
import { Paginate } from "../../utils/paginate"
import { dashQuest } from "./data"
import ModalDetalhes from "./modals/modalDetalhes"

function DashQuestion() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [status, setStatus] = useState<StatusEnum>(StatusEnum.Pending);
    const [openModalEdit, setOpenModalEdit] = useState<boolean>(false);
    const [openModalRegister, setOpenModalRegister] = useState<boolean>(false);
    const [questionSelect, setQuestionSelect] = useState<Question | null>(null)
    const dataRef = useRef<Question[]>([])
    const limitCards = 40;

    const [infosQuestion, setInfosQuestion] = useState<InfoQuestion>({
        provas: [],
        materias: [],
        frentes: [],
        exames: []
    } as InfoQuestion)

    const { data: { token, permissao }} = useAuthStore()

    const cardTransformation = (question: Question) : CardDash => (
        {id: question._id, title: question.title, status: question.status, infos: 
            [
                { field:"Id", value: question._id },
                { field:"Prova", value: infosQuestion.provas.find(infos => infos._id === question.prova)?.nome ?? question.prova },
                { field:"Área", value: question.enemArea},
                { field:"Disciplina", value: infosQuestion.materias.find(infos => infos._id === question.materia)?.nome ?? question.materia},
                { field:"Ultima Atulizacao", value: question.updatedAt ? formatDate(question.updatedAt.toString()) : ""},
            ]
        }
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputChange = (event: any) => {
        event.target.value.toLowerCase();
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
                        return {...mergeObjects(questionUpdate, question), title: `${question._id} ${questionUpdate.numero}`} as Question
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
        if(!questionSelect?.prova) {
            toast.info('Não é possível aprovar ou rejeitar questões sem referenciar uma prova. Selecione uma prova, salve o cadastro e tente novamente')
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

    const getQuestions = useCallback(async (status: StatusEnum, page: number, limit: number) => {
        getAllQuestions(token, status, page, limit)
            .then((res) => {
                console.log(res)
                setQuestions(res.data)
            })
            .catch((erro: Error) => {
                toast.error(erro.message)
            })
    }, [token])

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
        getQuestions(status, 1, limitCards)
    },[status, getQuestions])

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
                // { label: "Historico", children: <>Teste 2</>}
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
                         />}
            ]} />
    }

    const getMoreCards = async ( page: number) : Promise<Paginate<Question>> => {
        toast.success(page)
        return await getAllQuestions(token, status, page, limitCards)
    }

    return (
        <>
            <DashCardTemplate 
                title={dashQuest.title} 
                entities={questions} 
                setEntities={setQuestions}
                cardTransformation={cardTransformation}
                onLoadMoreCard={getMoreCards}
                onClickCard={onClickCard} 
                limitCardPerPage={limitCards}
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