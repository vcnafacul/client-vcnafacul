import { useEffect, useRef, useState } from "react"
import { ContentDtoInput } from "../../../dtos/content/contentDtoInput"
import { formatDate } from "../../../utils/date"
import { CardDashInfo } from "../../../components/molecules/cardDash"
import { useAuthStore } from "../../../store/auth"
import DashCardTemplate from "../../../components/templates/dashCardTemplate"
import { dashAllContent } from "./data"
import { getContent } from "../../../services/content/getContent"
import { toast } from "react-toastify"
import Filter from "../../../components/atoms/filter"
import Button from "../../../components/molecules/button"
import NewDemand from "../modals/newDemand"
import Select from "../../../components/atoms/select"
import { StatusEnum } from "../../../enums/generic/statusEnum"
import { StatusContent } from "../../../enums/content/statusContent"
import ValidatedDemand from "../modals/validatedDemand"
import ShowDemand from "../modals/showDemand"

import { ReactComponent as SettingIcon } from '../../../assets/icons/setting.svg'
import SettingsContent from "../modals/settingsContent"
import { Roles } from "../../../enums/roles/roles"
import { MateriasLabel } from "../../../types/content/materiasLabel"
import { Materias } from "../../../enums/content/materias"
import { OptionProps } from "../../../components/atoms/selectOption"

function AllContent() {

    const [openShowModal, setOpenShowModal]= useState<boolean>(false)
    const [settings, setSettings] = useState<boolean>(false)
    const [openNewModalDemand, setOpenNewModalDemand]= useState<boolean>(false)
    const [demands, setDemands] = useState<ContentDtoInput[]>([])
    const [demandSelected, setDemandSelected] = useState<ContentDtoInput | null>(null)
    const [materias]= useState<OptionProps[]>(() => {
        const mat = MateriasLabel.map(materia => ({ id: materia.value, name: materia.label}))
        mat.unshift({ id: -1 as Materias, name: 'Todos'})
        return mat
    })
    const [materiaSelected, setMateriaSelected] = useState<number>(materias[0].id as number)
    const [status, setStatus] = useState<StatusContent | StatusEnum>(StatusEnum.Approved);
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

    const { data: { token, permissao }} = useAuthStore()

    const onClickCard = (id: number | string) => {
        setDemandSelected(dataRef.current.find(demand => demand.id === id)!)
        setOpenShowModal(true)
    }

    const addDemand = (data: ContentDtoInput) => {
        dataRef.current.push(data)
        setDemands(dataRef.current)
    }

    const handleRemoveDemand = (id: number) => {
        const newContent = demands.filter(q => q.id != id)
        setDemands(newContent)
    }

    useEffect(() => {
    getContent(token, status as StatusContent)
        .then(res => {
            setDemands(res)
            dataRef.current = res;
        })
        .catch((error: Error) => {
            toast.error(error.message);
        })
    },[token, status])

    const ValidatedModalDemand = () => {
        if(!openShowModal) return null
        if(demandSelected?.status === StatusContent.Pending_Upload){
            return <ShowDemand 
            demand={demandSelected!} 
            handleClose={() => setOpenShowModal(false)} 
            updateStatusDemand={handleRemoveDemand}/>
        }
        return <ValidatedDemand 
        demand={demandSelected!} 
        updateStatusDemand={handleRemoveDemand}
        handleClose={() => setOpenShowModal(false)}/>
    }

    const NewModalDemand = () => {
        if(!openNewModalDemand) return null
        return <NewDemand handleClose={() => setOpenNewModalDemand(false)} addDemand={addDemand} />
    }

    const SettingsModal = () => {
        if(!settings) return null
        return <SettingsContent handleClose={() => { setSettings(false)}} />
    }

    const FilterManager = () => {
        if(!permissao[Roles.gerenciadorDemanda]) return null
        return (
            <div className="flex">
                <Button onClick={() => { setDemandSelected(null); setOpenNewModalDemand(true) }} typeStyle="quaternary" 
                    className="text-xl font-light rounded-full h-8 "><span className="text-4xl">+</span>Nova Demanda</Button>,
                <SettingIcon onClick={() => { setSettings(true) }} className="w-10 h-10 fill-marine opacity-75 hover:opacity-100 cursor-pointer transition-all duration-300" />
            </div>
        )
    }

    const FilterSelect = () => {
        return (
            <div className="flex gap-1 justify-center flex-wrap sm:flex-nowrap">
                <Select options={materias}  defaultValue={materiaSelected}  setState={selectDemandByMateria} />,
                {permissao[Roles.validarCursinho] ? <Select options={dashAllContent.options}  defaultValue={status}  setState={setStatus} /> : <></>}
            </div>
        )
    }
    
    return (
        <>
            <DashCardTemplate 
                cardlist={cardContent} 
                title={dashAllContent.title}
                filterList={[
                    <Filter placeholder="título | Tema | Frente | Descrição" filtrar={handleInputChange}/>,
                    <FilterSelect />,
                    <FilterManager />
                ]} 
                onClickCard={onClickCard} />
            <ValidatedModalDemand />
            <NewModalDemand />
            <SettingsModal />
    </>
    )
}

export default AllContent