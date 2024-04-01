import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import Select from "../../../components/atoms/select"
import Button from "../../../components/molecules/button"
import DashCardTemplate from "../../../components/templates/dashCardTemplate"
import { ContentDtoInput } from "../../../dtos/content/contentDtoInput"
import { StatusContent } from "../../../enums/content/statusContent"
import { StatusEnum } from "../../../enums/generic/statusEnum"
import { getContent } from "../../../services/content/getContent"
import { useAuthStore } from "../../../store/auth"
import NewDemand from "../modals/newDemand"
import ShowDemand from "../modals/showDemand"
import ValidatedDemand from "../modals/validatedDemand"
import { dashAllContent } from "./data"

import { ReactComponent as SettingIcon } from '../../../assets/icons/setting.svg'
import { OptionProps } from "../../../components/atoms/selectOption"
import { Materias } from "../../../enums/content/materias"
import { Roles } from "../../../enums/roles/roles"
import { MateriasLabel } from "../../../types/content/materiasLabel"
import { Paginate } from "../../../utils/paginate"
import { cardTransformationContent } from "../data"
import SettingsContent from "../modals/settingsContent"

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
    const limitCards = 40;

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

    useEffect(() => {
        getContent(token, status as StatusContent, undefined, 1, limitCards)
            .then(res => {
                setDemands(res.data)
                dataRef.current = res.data;
            })
            .catch((error: Error) => {
                toast.error(error.message);
            })
        },[token, status])
    
    const getMoreCards = async ( page: number) : Promise<Paginate<ContentDtoInput>> => {
        return await getContent(token, status as StatusContent, undefined, page, limitCards)
    }
    
    return (
        <>
            <DashCardTemplate 
                title={dashAllContent.title}
                entities={demands}
                setEntities={setDemands} 
                cardTransformation={cardTransformationContent}
                onLoadMoreCard={getMoreCards}
                filterList={[
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