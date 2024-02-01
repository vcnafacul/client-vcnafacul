import { StatusEnum } from "../../enums/generic/statusEnum";

export const dashGeo = {
    title: 'Validação Localiza Cursinho',
    options: [
        { name: 'Pendente', id: StatusEnum.Pending},
        { name: 'Aprovado', id: StatusEnum.Approved},
        { name: 'Reprovado', id: StatusEnum.Rejected},
    ]
}