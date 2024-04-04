import { CardDash } from "../../components/molecules/cardDash"
import { ContentDtoInput } from "../../dtos/content/contentDtoInput"
import { formatDate } from "../../utils/date"

export const dashContent = {
    title: 'Conteúdo Cursinho (Demandas)',
}

export const cardTransformationContent = (content: ContentDtoInput) : CardDash =>  (
    {id: content.id, title: content.title, status: content.status, infos: 
        [
            { field:"Frente", value: content.subject.frente.name },
            { field:"Tema", value: content.subject.name },
            { field:"Descrição", value: content.description.substring(0, 20) + "..." },
            { field:"Cadastrado em ", value: content.createdAt ? formatDate(content.createdAt.toString()) : ""},
        ]
    }
)