/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../components/molecules/button";
import { CardDash } from "../../components/molecules/cardDash";
import DashCardTemplate from "../../components/templates/dashCardTemplate";
import { Prova } from "../../dtos/prova/prova";
import { ITipoSimulado } from "../../dtos/simulado/tipoSimulado";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { Roles } from "../../enums/roles/roles";
import { getProvas } from "../../services/prova/getProvas";
import { getTipos } from "../../services/tipoSimulado/getTipos";
import { useAuthStore } from "../../store/auth";
import { formatDate } from "../../utils/date";
import { Paginate } from "../../utils/paginate";
import { dashProva } from "./data";
import NewProva from "./modals/newProva";
import ShowProva from "./modals/showProva";

function DashProva(){
    const [provas, setProvas] = useState<Prova[]>([])
    const [provaSelected, setProvaSelected] = useState<Prova | null>(null)

    const [tipoSimulado, setTipoSimulado] = useState<ITipoSimulado[]>()

    const [openNewProva, setOpenNewProva] = useState<boolean>(false);
    const [showProva, setShowProva] = useState<boolean>(false);
    const dataRef = useRef<Prova[]>([])
    const limitCards = 40;

    const { data: { token, permissao }} = useAuthStore()

    const cardTransformation = (prova: Prova) : CardDash => (
        {id: prova._id, title: prova.nome, 
            status: prova.totalQuestao === prova.totalQuestaoValidadas ? StatusEnum.Approved : 
                prova.totalQuestao === prova.totalQuestaoCadastradas ? StatusEnum.Pending : 
                StatusEnum.Rejected, 
            infos: 
            [
                { field:"Total de Questões", value: prova.totalQuestao.toString() },
                { field:"Total de Questões Cadastradas", value: prova.totalQuestaoCadastradas.toString()},
                { field:"Total de Questões Validadas", value: prova.totalQuestaoValidadas.toString()},
                { field:"Cadastrado em ", value: prova.createdAt ? formatDate(prova.createdAt.toString()) : ""},
            ]
        }
    )

    const onClickCard = (id: string | number) => {
        setProvaSelected(provas.find(p => p._id === id)!)
        setShowProva(true)
    }

    const addProva = (data: Prova) => {
        dataRef.current.push(data)
        setProvas(dataRef.current)
    }

    const ModalNewProva = () => {
        if(!openNewProva) return null
        return <NewProva tipos={tipoSimulado!} handleClose={() => setOpenNewProva(false)} addProva={addProva} />
    }

    const ModalShowProva = () => {
        if(!showProva) return null
        return <ShowProva prova={provaSelected!} handleClose={() => { setShowProva(false)}} />
    }

    useEffect(() => {
        getProvas(token, 1, limitCards)
            .then(res => {
                setProvas(res.data)
            })
            .catch((erro: Error) => {
                toast.error(erro.message)
            })

        getTipos(token)
            .then(res => {
                setTipoSimulado(res)
            })
            .catch((erro: Error) => {
                toast.error(erro.message)
            })
    },[token])

    const getMoreCards = async ( page: number) : Promise<Paginate<Prova>> => {
        return await getProvas(token, page, limitCards)
    }

    return (
        <>
        <DashCardTemplate<Prova>
            title={dashProva.title} 
            entities={provas}
            setEntities={setProvas}
            cardTransformation={cardTransformation}
            onLoadMoreCard={getMoreCards}
            limitCardPerPage={limitCards}
            onClickCard={onClickCard} 
            filterList={[
                <Button disabled={!permissao[Roles.cadastrarProvas]} onClick={() => { setProvaSelected(null); setOpenNewProva(true) }} typeStyle="quaternary" 
                    className="text-xl font-light rounded-full h-8 "><span className="text-4xl">+</span>Cadastrar Prova</Button>
            ]} />
        <ModalNewProva />
        <ModalShowProva />
        </>
    )
}

export default DashProva