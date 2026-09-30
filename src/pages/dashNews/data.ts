import { StatusEnum } from "../../enums/generic/statusEnum";

export const dashNews = {
  title: "Novidades",
  // Rótulos iguais aos da coluna Status (Ativa/Inativa): filtro e coluna
  // falam a mesma língua.
  options: [
    { name: "Ativas", id: StatusEnum.Approved },
    { name: "Inativas", id: StatusEnum.Rejected },
  ],
};
