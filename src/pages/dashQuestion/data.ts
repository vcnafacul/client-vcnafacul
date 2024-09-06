import { StatusEnum } from "../../enums/generic/statusEnum";

export const dashQuest = {
  title: "Banco de questao",
  options: [
    { name: "Status", id: StatusEnum.All },
    { name: "Pendente", id: StatusEnum.Pending },
    { name: "Aprovado", id: StatusEnum.Approved },
    { name: "Reprovado", id: StatusEnum.Rejected },
  ],
};

export enum Order {
  Increasing = 0,
  Decreasing,
}

export const filters = [
  { name: "Crescente", id: Order.Increasing },
  { name: "Decrescente", id: Order.Decreasing },
];
