import { StatusContent } from "../../../enums/content/statusContent";
import { StatusEnum } from "../../../enums/generic/statusEnum";

export const dashAllContent = {
    title: 'Conteúdos',
    options: [
        { name: 'Pendente Upload', id: StatusContent.Pending_Upload},
        { name: 'Pendente', id: StatusEnum.Pending},
        { name: 'Aprovado', id: StatusEnum.Approved},
        { name: 'Reprovado', id: StatusEnum.Rejected},
    ]
}