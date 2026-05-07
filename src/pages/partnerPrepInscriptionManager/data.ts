import { StatusEnum } from "@/enums/generic/statusEnum";

export const dataInscription = {
  inscription: "Processo Seletivo",
  title: "Processos Seletivos",
  openingText: "Número de Vagas",
  messageNotAllowEdit:
    "Não é possível editar este processo seletivo pois já existe um processo seletivo ativo",
  warningDeleteTitle: "Deseja realmente excluir o processo seletivo?",
  warningDelete:
    "Ao excluir o processo seletivo todas as inscrições realizadas serão perdidas.",
  statusOptions: [
    { name: "Todos", id: StatusEnum.All },
    { name: "Ativo", id: StatusEnum.Approved },
    { name: "Encerrado", id: StatusEnum.Rejected },
    { name: "Pendente", id: StatusEnum.Pending },
  ],
};
