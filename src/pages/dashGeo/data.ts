import { StatusEnum } from "../../types/geolocation/statusEnum";

export const dashGeo = {
    title: 'Validação Localiza Cursinho',
    options: [
        { name: 'Pendente', id: StatusEnum.Pending},
        { name: 'Aprovado', id: StatusEnum.Approved},
        { name: 'Reprovado', id: StatusEnum.Rejected},
    ]
}