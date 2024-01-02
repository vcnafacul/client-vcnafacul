/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react"
import Button from "../../../components/molecules/button"
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { getContentOrder } from "../../../services/content/getContent"
import { useAuthStore } from "../../../store/auth"
import { toast } from "react-toastify"
import { ContentDtoInputOrder } from "../../../dtos/content/contentDtoInput"
import Text from "../../../components/atoms/text"
import PropValue from "../../../components/molecules/PropValue"
import { getStatusIcon } from "../../../utils/getStatusIcon"
import { formatDate } from "../../../utils/date"
import ChangeOrder from "./changeOrder"
import { TbArrowsExchange } from "react-icons/tb";
import { OptionProps } from "../../../components/atoms/select"
import { ChangeOrderDTO } from "../../../dtos/content/changeOrder"
import { changeOrderDemand } from "../../../services/content/changeOrderDemand"

interface ViewOrderProps extends ModalProps{
    subjectId: number
}

export interface DemandSelected {
    title: string;
    nodeId: number;
    order: number;
}

function ViewOrder({ handleClose, subjectId } : ViewOrderProps) {
    const [contents, setContents] = useState<ContentDtoInputOrder[]>([]);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [demandSelected, setDemandSelected] = useState<DemandSelected>()

    const { data: { token }} = useAuthStore()

    useEffect(() => {
        getContentOrder(token, undefined, subjectId)
            .then(res => {
                setContents(res)
            })
            .catch((error: Error) => {
                toast.error(error.message);
            })
    }, [subjectId, token])

    const Contents = () => contents.map((content, index) => (
        <div key={index} className={`${index % 2 == 0 ? 'bg-blue-200' : 'bg-white'}`}>
            <div className="flex gap-4">
                <div className="w-10 flex justify-center items-center">{getStatusIcon(content.status)}</div>
                <div className="w-60"><PropValue prop="Título" value={content.title} /></div>
                <div className="w-60"><PropValue prop="Criado em" value={formatDate(content.createdAt.toString())} /></div>
                <div className="w-28"><PropValue prop="Ordem" value={index + 1} /></div>
                <TbArrowsExchange className="w-7 h-7 rotate-90 cursor-pointer" title="Alterar Order" onClick={() => { 
                    setDemandSelected({ nodeId: content.id, title: content.title, order: index + 1})
                    setOpenModal(true) 
                    }} />
            </div>
        </div>
    ))

    const optionNumber = () : OptionProps[] => {
        const options: OptionProps[] = []
        for (let index = 1; index < contents.length + 1; index++) {
            if(index !== demandSelected!.order) {
                options.push({ id: index, name: index.toString()})
            }
            
        }
        return options
    }

    const updateNode = (position: number) => {

        let node2 = undefined
        if(position !== 0) {
            node2 = contents[position].id
        }

        console.log(position)

        const body: ChangeOrderDTO = {
            listId: subjectId,
            node1: demandSelected!.nodeId,
            node2: node2
        }
        console.log(body)
        changeOrderDemand(token, body)
            .then(_ => {
                const objetoSelecionado = contents.find(obj => obj.id === demandSelected!.nodeId);
                const listaAtualizada = contents.filter(obj => obj.id !== demandSelected!.nodeId);
                listaAtualizada.splice(position , 0, objetoSelecionado!)
                setContents(listaAtualizada)
                setOpenModal(false)
            })
            .catch((error: Error) => {
                toast.error(error.message);
            })
    }

    const ModalChengeOrder = () => {
        if(!openModal) return null
        return <ChangeOrder updateNode={updateNode} demand={demandSelected!} optionNumber={optionNumber()} handleClose={() => { setOpenModal(false) }} />
    }


    return (
        <>
        <ModalTemplate>
            <div className="bg-white py-2 px-4 rounded">
                {contents.length > 0 ? <Text size="secondary" >{contents[0].subject.name}</Text> : <></>}
                <Contents />
                <Button onClick={handleClose}>Fechar</Button>
            </div>
        </ModalTemplate>
        <ModalChengeOrder />
        </>
    )
}

export default ViewOrder