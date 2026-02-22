import { StatusContent } from "@/enums/content/statusContent";
import { CardDash } from "../../components/molecules/cardDash";
import { ContentDtoInput } from "../../dtos/content/contentDtoInput";
import { formatDate } from "../../utils/date";
import { StatusEnum } from "@/enums/generic/statusEnum";

export const dashContent = {
  title: "Conteúdo Cursinho (Demandas)",
};

export const cardTransformationContent = (
  content: ContentDtoInput
): CardDash => ({
  id: content.id ?? (content as any)._id,
  title: content.title,
  status: content.status,
  infos: [
    { field: "Frente", value: content.subject.frente.nome },
    { field: "Tema", value: content.subject.name },
    { field: "Descrição", value: content.description.substring(0, 20) + "..." },
    {
      field: "Cadastrado em ",
      value: content.createdAt ? formatDate(content.createdAt.toString()) : "",
    },
  ],
});

export const dashAllContent = {
    title: 'Conteúdos',
    options: [
        { name: 'Pendente Upload', id: StatusContent.Pending_Upload},
        { name: 'Pendente', id: StatusEnum.Pending},
        { name: 'Aprovado', id: StatusEnum.Approved},
        { name: 'Reprovado', id: StatusEnum.Rejected},
    ]
}