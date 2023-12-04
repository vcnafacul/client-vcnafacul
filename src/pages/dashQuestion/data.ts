import { FormFieldOption } from "../../components/molecules/formField";
import { StatusEnum } from "../../types/generic/statusEnum";

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

export const ArrayCor : FormFieldOption[] = [
    { label: 'Azul', value: 'Azul'},
    { label: 'Rosa', value: 'Rosa'},
    { label: 'Amarelo', value: 'Amarelo'},
    { label: 'Cinza', value: 'Cinza'},
    { label: 'Branco', value: 'Branco'},
]

export const AreaEnem : FormFieldOption[] = [
    { label: 'Ciências Humanas', value: 'Ciências Humanas'},
    { label: 'Linguagens', value: 'Linguagens'},
    { label: 'Ciências da Natureza', value: 'Ciências da Natureza'},
    { label: 'Matemática', value: 'Matemática'},
]

export const Edicao : FormFieldOption[] = [
    { label: 'Regular', value: 'Regular'},
]