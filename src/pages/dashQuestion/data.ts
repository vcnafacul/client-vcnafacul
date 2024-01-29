import { FormFieldOption } from "../../components/molecules/formField";
import { StatusEnum } from "../../enums/generic/statusEnum";

export const dashQuest = {
    title: 'Banco de questao',
    options: [
        { name: 'Pendente', id: StatusEnum.Pending},
        { name: 'Aprovado', id: StatusEnum.Approved},
        { name: 'Reprovado', id: StatusEnum.Rejected},
    ]
}

export enum Order {
    Increasing = 0,
    Decreasing,
}

export const filters = [
    {name: 'Crescente', id: Order.Increasing},
    {name: 'Decrescente', id: Order.Decreasing}
]

interface AreaEnemFormFieldOption extends FormFieldOption {
    day: string
}

export const AreaEnem : AreaEnemFormFieldOption[] = [
    { day: 'Dia 1', label: 'Ciências Humanas', value: 'Ciências Humanas'},
    { day: 'Dia 1', label: 'Linguagens', value: 'Linguagens'},
    { day: 'Dia 2', label: 'Ciências da Natureza', value: 'Ciências da Natureza'},
    { day: 'Dia 2', label: 'Matemática', value: 'Matemática'},
]