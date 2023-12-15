/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import DashCardTemplate from "../../components/templates/dashCardTemplate";
import { Prova } from "../../dtos/prova/prova";
import { CardDashInfo } from "../../components/molecules/cardDash";
import { StatusEnum } from "../../types/generic/statusEnum";
import { formatDate } from "../../utils/date";
import { dashProva } from "./data";
import { getProvas } from "../../services/prova/getProvas";
import { useAuthStore } from "../../store/auth";
import { toast } from "react-toastify";
import ShowProva from "./modals/showProva";
import Filter from "../../components/atoms/filter";
import Button from "../../components/molecules/button";
import { Roles } from "../../enums/roles/roles";
import NewProva from "./modals/newProva";

function DashProva(){
    const [provas, setProvas] = useState<Prova[]>([])
    const [provaSelected, setProvaSelected] = useState<Prova | null>(null)
    const [openNewProva, setOpenNewProva] = useState<boolean>(false);
    const [showProva, setShowProva] = useState<boolean>(false);
    const dataRef = useRef<Prova[]>([])

    const { data: { token, permissao }} = useAuthStore()

    const cardProvas : CardDashInfo[] = provas.map(prova => (
        {cardId: prova._id, title: prova.nome, status: StatusEnum.Approved, infos: 
            [
                { field:"Total de Questões", value: prova.totalQuestao.toString() },
                { field:"Total de Questões Cadastradas", value: prova.totalQuestaoCadastradas.toString()},
                { field:"Total de Questões Validadas", value: prova.totalQuestaoValidadas.toString()},
                { field:"Cadastrado em ", value: prova.createdAt ? formatDate(prova.createdAt.toString()) : ""},
            ]
        }
    ))

    const handleInputChange = (event: any) => {
        const filter = event.target.value.toLowerCase();
        if(!filter) setProvas(dataRef.current)
        else setProvas(dataRef.current.filter(q => q._id.includes(filter) || q.nome.toLowerCase().includes(filter)))
    }

    const onClickCard = (id: string | number) => {
        setProvaSelected(provas.find(p => p._id === id)!)
        setShowProva(true)
    }

    const addProva = (data: Prova) => {
        dataRef.current.push(data)
        setProvas(dataRef.current)
    }

    useEffect(() => {
        getProvas(token)
            .then(res => {
                console.log(res)
                setProvas(res)
                dataRef.current = res;
            })
            .catch((erro: Error) => {
                toast.error(erro.message)
            })
    },[token])

    const ModalNewProva = () => {
        if(!openNewProva) return null
        return <NewProva handleClose={() => setOpenNewProva(false)} addProva={addProva} />
    }

    const ModalShowProva = () => {
        if(!showProva) return null
        return <ShowProva prova={provaSelected!} handleClose={() => { setShowProva(false)}} />
    }


    return (
        <>
        <DashCardTemplate 
            cardlist={cardProvas} 
            onClickCard={onClickCard} 
            title={dashProva.title} 
            filterList={[
                <Filter placeholder="id | texto" filtrar={handleInputChange}/>,
                <Button disabled={!permissao[Roles.cadastrarProvas]} onClick={() => { setProvaSelected(null); setOpenNewProva(true) }} typeStyle="quaternary" 
                    className="text-xl font-light rounded-full h-8 "><span className="text-4xl">+</span>Cadastrar Prova</Button>
            ]} />
        <ModalNewProva />
        <ModalShowProva />
        </>
    )
}

export default DashProva