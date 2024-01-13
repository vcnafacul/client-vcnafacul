import { useEffect, useState } from "react"
import { getSimulados } from "../../services/simulado/getSimulados"
import { useAuthStore } from "../../store/auth"
import { toast } from "react-toastify"
import { ISimuladoDTO } from "../../dtos/simulado/simuladoDto"
import { CardDashInfo } from "../../components/molecules/cardDash"
import { StatusEnum } from "../../enums/generic/statusEnum"
import DashCardTemplate from "../../components/templates/dashCardTemplate"
import { formatDate } from "../../utils/date"

function DashSimulado(){
    const [simulados, setSimulados] = useState<ISimuladoDTO[]>([])
    const { data: { token }} = useAuthStore()


    const cardSimulado : CardDashInfo[] = simulados.map(simulado => (
        {cardId: simulado._id, title: simulado.nome, status: simulado.bloqueado ? StatusEnum.Rejected : StatusEnum.Approved, infos: 
            [
                { field:"Tipo", value: simulado.tipo.nome },
                { field:"Duracao", value: simulado.tipo.duracao.toString() + " minutos" },
                { field:"Questoes", value: `${simulado.questoes.length.toString()}/${simulado.tipo.quantidadeTotalQuestao.toString()}` },
                { field:"Descrição", value: (simulado.descricao && simulado.descricao.length > 20) ? simulado.descricao.substring(0, 20) + "..." : simulado.descricao},
                { field:"Atualizado em ", value: simulado.updatedAt ? formatDate(simulado.updatedAt.toString()) : ""},
            ]
        }
    ))

    useEffect(() => {
        const id = toast.loading("Buscando Simulados ... ")
        getSimulados(token)
            .then(res => {
                setSimulados(res)
                toast.dismiss(id)
            })
            .catch((error: Error) => {
                toast.update(id, {render: error.message, type: "error", isLoading: false, autoClose: 3000, });
            })
    }, [])

    return (
        <DashCardTemplate
        cardlist={cardSimulado}
        title="Simulados"
        filterList={[]}
        onClickCard={() => {}}
            />
    )
}

export default DashSimulado