import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { FilterProps } from "../../components/atoms/filter"
import { SelectProps } from "../../components/atoms/select"
import { ButtonProps } from "../../components/molecules/button"
import { CardDash } from "../../components/molecules/cardDash"
import DashCardTemplate from "../../components/templates/dashCardTemplate"
import ModalTabTemplate from "../../components/templates/modalTabTemplate"
import { DashCardContext } from "../../context/dashCardContext"
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
import { EnemArea } from "../../types/question/enemArea"

function DashQuestion() {
    const [questions, setQuestions] = useState<Question[]>([])

    //filters
    const [status, setStatus] = useState<StatusEnum>(StatusEnum.Pending);
    const [materia, setMateria] = useState<string>('')
    const [frente, setFrente] = useState<string>('')
    const [prova, setProva] = useState<string>('')
    const [enemArea, setEnemArea] = useState<string>('')
    const [filterText, setFilterText] = useState<string>('');
    const [enterText, setEnterText] = useState<string>('');


    const [openModalEdit, setOpenModalEdit] = useState<boolean>(false);
    const [openModalRegister, setOpenModalRegister] = useState<boolean>(false);
    const [questionSelect, setQuestionSelect] = useState<Question | null>(null)
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

    const handleRemoveQuestion = (id: string) => {
        const newQuestions = questions.filter(q => q._id != id)
        setQuestions(newQuestions)
    }

    const handleAddQuestion = (question: Question) => {
        setQuestions([...questions, question])
    }

    const handleUpdateQuestion = (questionUpdate: UpdateQuestion) => {
        updateQuestion(questionUpdate, token)
            .then(() => {
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
            .then(() => {
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

    const getQuestions = useCallback(async (status: StatusEnum, page: number, limit: number, 
        materia: string, frente: string, prova: string, enemArea: string) => {
        getAllQuestions(token, status, enterText, page, limit, materia, frente, prova, enemArea)
            .then((res) => {
                setQuestions(res.data)
            })
            .catch((erro: Error) => {
                toast.error(erro.message)
            })
    }, [token, enterText])

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
        return await getAllQuestions(token, status, enterText, page, limitCards, materia, frente, prova, enemArea)
    }

    const filterProps : FilterProps = {
        filtrar: (e: React.ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value.toLowerCase()),
        placeholder:"texto questão", 
        defaultValue:filterText,
        keyDown:() => setEnterText(filterText)
    } 

    useEffect(() => {
        getQuestions(status, 1, limitCards, materia, frente, prova, enemArea)
    },[status, getQuestions, materia, frente, prova, enemArea])

    useEffect(() => {
        getInfors()
    }, [getInfors])

    const materiasOption = [{ id: '', name: 'Disciplinas'}, ...infosQuestion.materias.map(m => ({ id: m._id, name: m.nome }))]
    const frentesOption = [{ id: '', name: 'Frentes'}, ...infosQuestion.frentes.map(f => ({ id: f._id, name: f.nome }))]
    const provasOption = [{ id: '', name: 'Provas'}, ...infosQuestion.provas.map(p => ({ id: p._id, name: p.nome }))]
    const EnemAreaOption = [{ id: '', name: 'Área do Enem'}, ...EnemArea.map(p => ({ id: p, name: p }))]

    const selectFiltes: SelectProps[] = [
        { options: dashQuest.options,  defaultValue: status,  setState: setStatus },
        { options: materiasOption,  defaultValue: materia,  setState: setMateria },
        { options: frentesOption,  defaultValue: frente,  setState: setFrente },
        { options: provasOption,  defaultValue: prova,  setState: setProva },
        { options: EnemAreaOption,  defaultValue: enemArea,  setState: setEnemArea },
    ]

    const buttons : ButtonProps[] = [
        { disabled: !permissao[Roles.criarQuestao], onClick: () => { setQuestionSelect(null); setOpenModalRegister(true) },
            typeStyle: "quaternary", className:"text-xl font-light rounded-full h-8", children: 'Cadastrar Questao'
        }
    ]
    return (
        <DashCardContext.Provider value={{ title: dashQuest.title, entities: questions, 
            setEntities: setQuestions, onClickCard, getMoreCards, cardTransformation, 
            limitCards, filterProps, selectFiltes, buttons }}>
            <DashCardTemplate />
            <ModalEdit />
            <ModalRegister />
        </DashCardContext.Provider>
    )
}

export default DashQuestion