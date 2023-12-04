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
        console.log('teste')
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
                        handleClose={() => { setOpenModal(false) }} />}, 
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