import { useState, useRef, useEffect } from "react"
import { toast } from "react-toastify"
import { CardDashInfo } from "../../../components/molecules/cardDash"
import DashCardTemplate from "../../../components/templates/dashCardTemplate"
import { ContentDtoInput } from "../../../dtos/content/contentDtoInput"
import { getDemands } from "../../../services/content/getDemands"
import { useAuthStore } from "../../../store/auth"
import { formatDate } from "../../../utils/date"
import { dashOnlyDemand } from "./data"
import ShowDemand from "../modals/showDemand"
import Filter from "../../../components/atoms/filter"
import Select, { OptionProps } from "../../../components/atoms/select"
import { MateriasLabel } from "../../../types/content/materiasLabel"
import { Materias } from "../../../enums/content/materias"


function OnlyDemand() {
    const [openShowModal, setOpenShowModal]= useState<boolean>(false)
    const [demands, setDemands] = useState<ContentDtoInput[]>([])
    const [demandSelected, setDemandSelected] = useState<ContentDtoInput>()
    const [materias]= useState<OptionProps[]>(() => {
        const mat = MateriasLabel.map(materia => ({ id: materia.value, name: materia.label}))
        mat.unshift({ id: -1 as Materias, name: 'Todos'})
        return mat
    })
    const [materiaSelected, setMateriaSelected] = useState<number>(materias[0].id)
    const dataRef = useRef<ContentDtoInput[]>([])

    const cardContent : CardDashInfo[] = demands.map(content => (
        {cardId: content.id, title: content.title, status: content.status, infos: 
            [
                { field:"Frente", value: content.subject.frente.name },
                { field:"Tema", value: content.subject.name },
                { field:"Descrição", value: content.description.substring(0, 20) + "..." },
                { field:"Cadastrado em ", value: content.createdAt ? formatDate(content.createdAt.toString()) : ""},
            ]
        }
    ))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputChange = (event: any) => {
        const filter = event.target.value.toLowerCase();
        if(!filter) setDemands(dataRef.current)
        else setDemands(dataRef.current.filter(
            q => q.title.toLowerCase().includes(filter) || 
            q.description.toLowerCase().includes(filter) ||
            q.subject.name.toLocaleLowerCase().includes(filter) ||
            q.subject.frente.name.toLocaleLowerCase().includes(filter)||
            q.subject.description.toLocaleLowerCase().includes(filter)
        ))
    }

    const selectDemandByMateria = (id: Materias) => {
        setMateriaSelected(id)
        if(id === -1 as Materias) setDemands(dataRef.current)
        else {
            setDemands(dataRef.current.filter(demand => {
                if(demand.subject.frente.materia === id) return demand
            }))
        }
    }

    const handleRemoveDemand = (id: number) => {
        const newContent = demands.filter(q => q.id != id)
        setDemands(newContent)
    }

    const { data: { token }} = useAuthStore()

    const onClickCard = (id: number | string) => {
        setDemandSelected(dataRef.current.find(demand => demand.id === id))
        setOpenShowModal(true)
    }

    useEffect(() => {
        const id = toast.loading("Buscando Demandas ... ")
        getDemands(token)
            .then(res => {
                setDemands(res)
                dataRef.current = res;
                toast.update(id, { render: 'Demandas ok ... ', type: 'success', isLoading: false, autoClose: 3000,})
            })
            .catch((error: Error) => {
                toast.update(id, {render: error.message, type: "error", isLoading: false, autoClose: 3000, });
            })
    },[token])

    const ShowModalDemand = () => {
        if(!openShowModal) return null
        return <ShowDemand 
        demand={demandSelected!} 
        updateStatusDemand={handleRemoveDemand}
        handleClose={() => setOpenShowModal(false)}/>
    }
    
    return (
        <>
            <DashCardTemplate 
                cardlist={cardContent} 
                title={dashOnlyDemand.title}
                filterList={[
                    <Filter placeholder="título | Tema | Frente | Descricão" filtrar={handleInputChange}/>,
                    <Select options={materias}  defaultValue={materiaSelected}  setState={selectDemandByMateria} />,
                ]} 
                onClickCard={onClickCard} />
            <ShowModalDemand />
        </>
    )
}

export default OnlyDemand