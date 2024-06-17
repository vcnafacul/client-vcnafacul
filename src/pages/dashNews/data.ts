import { StatusEnum } from "../../enums/generic/statusEnum";

export const dashNews = {
  title: "Conteúdo Novidades",
  options: [
    { name: "Aprovado", id: StatusEnum.Approved },
    { name: "Reprovado", id: StatusEnum.Rejected },
  ],
};
